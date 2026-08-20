'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { canvasKeyboardInteraction } from '@/lib/canvas-keyboard';
import type { ExportSnapshot } from '@/lib/export/plotter';
import { usePrefersReducedMotion } from '@/lib/motion';
import { clearBuffer, drawMarker, drawSegment, redrawLayers, type TrajectoryLayer } from '@/lib/render/accumulate';
import { project, type Rotation } from '@/lib/render/projection';

export type TrajectorySlot = {
  readonly id: string;
  readonly color: string;
};

export type TrajectoryCanvasProps = {
  readonly trajectories: readonly TrajectorySlot[];
  /** Optional discrete-event overlay (e.g. Poincaré-plane crossings) — a single colour, drawn as points rather than a connected line. */
  readonly markerColor?: string;
  readonly ariaLabel: string;
  /**
   * Called once if a pushed batch contains a non-finite value — a
   * trajectory that has escaped its bounding region is a bug, not chaos
   * (CLAUDE.md invariant 12), and RK4 divergence under an unstable
   * parameter combination shows up as Infinity/NaN well before it would
   * show up as "outside the known box". Latched: further batches for this
   * run are dropped rather than drawn as garbage.
   */
  readonly onEscape?: () => void;
};

export type TrajectoryCanvasHandle = {
  readonly pushPoints: (id: string, points: Float64Array) => void;
  readonly pushMarkers: (points: Float64Array) => void;
  readonly clear: () => void;
  readonly getSnapshot: () => ExportSnapshot;
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 60;
const DRAG_SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

/**
 * The one canvas primitive behind /jelajah, /banding and /irisan — drag to
 * rotate, wheel/keyboard to zoom, worker-streamed points drawn additively.
 * Trajectory count and colour are props (DESIGN-REWORK.md §2): the
 * divergence pair is two trajectories from an ε perturbation, the
 * comparison is three from three integrators, the section is one plus a
 * marker overlay, the explorer is one. The worker that produces the points
 * stays with the page, since integrate/divergence/compare/section workers
 * have different message shapes — this component only draws what it's
 * given via `pushPoints`/`pushMarkers`.
 */
export const TrajectoryCanvas = forwardRef<TrajectoryCanvasHandle, TrajectoryCanvasProps>(
  function TrajectoryCanvas({ trajectories, markerColor, ariaLabel, onEscape }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chunksRef = useRef<Map<string, Float64Array[]>>(new Map());
    const lastPointRef = useRef<Map<string, Float64Array | null>>(new Map());
    const markerChunksRef = useRef<Float64Array[]>([]);
    const rotationRef = useRef<Rotation>({ yaw: 0.6, pitch: -0.3 });
    const zoomRef = useRef(8);
    const draggingRef = useRef(false);
    const lastPointerRef = useRef({ x: 0, y: 0 });
    const redrawPendingRef = useRef(false);
    const escapedRef = useRef(false);
    const reducedMotion = usePrefersReducedMotion();

    const hasNonFinite = (points: Float64Array): boolean => {
      for (let i = 0; i < points.length; i++) {
        if (!Number.isFinite(points[i])) return true;
      }
      return false;
    };

    const chunksFor = (id: string): Float64Array[] => {
      let chunks = chunksRef.current.get(id);
      if (!chunks) {
        chunks = [];
        chunksRef.current.set(id, chunks);
      }
      return chunks;
    };

    const colorFor = (id: string): string =>
      trajectories.find((slot) => slot.id === id)?.color ?? trajectories[0]?.color ?? '';

    const layers = (): TrajectoryLayer[] => {
      const trajectoryLayers: TrajectoryLayer[] = trajectories.map((slot) => ({
        chunks: chunksFor(slot.id),
        color: slot.color,
      }));
      if (markerColor) {
        trajectoryLayers.push({ chunks: markerChunksRef.current, color: markerColor, kind: 'points' });
      }
      return trajectoryLayers;
    };

    const scheduleRedraw = () => {
      if (redrawPendingRef.current) return;
      redrawPendingRef.current = true;
      requestAnimationFrame(() => {
        redrawPendingRef.current = false;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        redrawLayers(ctx, layers(), {
          rotation: rotationRef.current,
          zoom: zoomRef.current,
          width: canvas.width,
          height: canvas.height,
        });
      });
    };

    useImperativeHandle(
      ref,
      () => ({
        pushPoints: (id, points) => {
          if (escapedRef.current) return;
          if (hasNonFinite(points)) {
            escapedRef.current = true;
            onEscape?.();
            return;
          }
          chunksFor(id).push(points);

          // Reduced motion: the whole run arrived as one complete batch —
          // render it in a single redraw instead of stroking each segment
          // in as it streams. DESIGN.md §7.
          if (reducedMotion) {
            scheduleRedraw();
            return;
          }
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!canvas || !ctx) return;
          const config = {
            rotation: rotationRef.current,
            zoom: zoomRef.current,
            width: canvas.width,
            height: canvas.height,
          };
          const color = colorFor(id);
          let prevPoint = lastPointRef.current.get(id) ?? null;
          for (let i = 0; i + 2 < points.length; i += 3) {
            const point = points.subarray(i, i + 3);
            const screen = project(point, config);
            if (prevPoint) {
              drawSegment(ctx, project(prevPoint, config), screen, color);
            }
            prevPoint = point;
          }
          lastPointRef.current.set(id, prevPoint);
        },
        pushMarkers: (points) => {
          if (!markerColor || escapedRef.current) return;
          if (hasNonFinite(points)) {
            escapedRef.current = true;
            onEscape?.();
            return;
          }
          markerChunksRef.current.push(points);

          if (reducedMotion) {
            scheduleRedraw();
            return;
          }
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!canvas || !ctx) return;
          const config = {
            rotation: rotationRef.current,
            zoom: zoomRef.current,
            width: canvas.width,
            height: canvas.height,
          };
          for (let i = 0; i + 2 < points.length; i += 3) {
            const point = points.subarray(i, i + 3);
            drawMarker(ctx, project(point, config), markerColor);
          }
        },
        clear: () => {
          escapedRef.current = false;
          for (const id of chunksRef.current.keys()) {
            chunksRef.current.set(id, []);
            lastPointRef.current.set(id, null);
          }
          markerChunksRef.current = [];
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx) clearBuffer(ctx, canvas.width, canvas.height);
        },
        getSnapshot: () => ({
          trajectories: trajectories.map((slot) => chunksFor(slot.id)),
          rotation: rotationRef.current,
        }),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [reducedMotion, markerColor, onEscape]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        scheduleRedraw();
      };
      resize();

      const observer = new ResizeObserver(resize);
      observer.observe(canvas.parentElement as Element);
      return () => observer.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // React attaches wheel listeners as passive by default, so preventDefault
    // (needed to stop the page from scrolling under the canvas) requires a
    // native listener registered with { passive: false }.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const onWheelNative = (event: WheelEvent) => {
        event.preventDefault();
        const factor = Math.exp(-event.deltaY * 0.001);
        zoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current * factor));
        scheduleRedraw();
      };

      canvas.addEventListener('wheel', onWheelNative, { passive: false });
      return () => canvas.removeEventListener('wheel', onWheelNative);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
      draggingRef.current = true;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!draggingRef.current) return;
      const dx = event.clientX - lastPointerRef.current.x;
      const dy = event.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };

      const rotation = rotationRef.current;
      const nextPitch = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, rotation.pitch - dy * DRAG_SENSITIVITY)
      );
      rotationRef.current = { yaw: rotation.yaw + dx * DRAG_SENSITIVITY, pitch: nextPitch };
      scheduleRedraw();
    };

    const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
      draggingRef.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
    };

    // Keyboard equivalent to drag-to-rotate / wheel-to-zoom — the canvas has
    // no native interactive role, so it needs tabIndex to be reachable at
    // all. WCAG 2.1.1.
    const onKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
      const next = canvasKeyboardInteraction(event.key, rotationRef.current, zoomRef.current, {
        pitchLimit: PITCH_LIMIT,
        zoomMin: ZOOM_MIN,
        zoomMax: ZOOM_MAX,
      });
      if (!next) return;
      event.preventDefault();
      rotationRef.current = next.rotation;
      zoomRef.current = next.zoom;
      scheduleRedraw();
    };

    return (
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label={ariaLabel}
        className="h-full w-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onKeyDown={onKeyDown}
      />
    );
  }
);
