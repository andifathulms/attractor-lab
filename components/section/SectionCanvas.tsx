'use client';

import { useEffect, useRef } from 'react';
import { canvasKeyboardInteraction } from '@/lib/canvas-keyboard';
import type { Plane } from '@/lib/dynamics/section';
import type { System } from '@/lib/dynamics/systems';
import { useT } from '@/lib/i18n/LocaleProvider';
import { REDUCED_MOTION_STEPS, usePrefersReducedMotion } from '@/lib/motion';
import { clearBuffer, drawMarker, redrawLayers, type TrajectoryLayer } from '@/lib/render/accumulate';
import { project, type Rotation } from '@/lib/render/projection';
import type {
  BatchMessage,
  StartMessage,
  WorkerOutboundMessage,
} from '@/workers/section.worker';

export type SectionMetrics = {
  readonly elapsed: number;
  readonly crossingCount: number;
};

export type SectionCanvasProps = {
  readonly system: System;
  readonly dt: number;
  readonly plane: Plane;
  readonly onMetrics: (metrics: SectionMetrics) => void;
  readonly onCrossings: (crossings: Float64Array) => void;
};

// The attractor itself renders faint — it's context for the plane, not the
// subject. The section is violet: "a different kind of object... a
// construction placed into the space rather than part of the trajectory."
// DESIGN.md §4.
const TRAJECTORY_COLOR = 'rgba(240, 192, 90, 0.05)';
const SECTION_COLOR = 'rgba(167, 139, 196, 0.9)';
const INITIAL_STATE: readonly [number, number, number] = [0.1, 0.1, 0.1];
const ZOOM_MIN = 1;
const ZOOM_MAX = 60;
const DRAG_SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

export function SectionCanvas({ system, dt, plane, onMetrics, onCrossings }: SectionCanvasProps) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunksRef = useRef<Float64Array[]>([]);
  const crossingChunksRef = useRef<Float64Array[]>([]);
  const lastPointRef = useRef<Float64Array | null>(null);
  const crossingCountRef = useRef(0);
  const rotationRef = useRef<Rotation>({ yaw: 0.6, pitch: -0.3 });
  const zoomRef = useRef(8);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const redrawPendingRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  const layers = (): TrajectoryLayer[] => [
    { chunks: chunksRef.current, color: TRAJECTORY_COLOR },
    { chunks: crossingChunksRef.current, color: SECTION_COLOR, kind: 'points' },
  ];

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

  // Re-integrates from scratch and clears the buffer — the only case that clears it.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    chunksRef.current = [];
    crossingChunksRef.current = [];
    lastPointRef.current = null;
    crossingCountRef.current = 0;
    clearBuffer(ctx, canvas.width, canvas.height);

    const worker = new Worker(new URL('../../workers/section.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      handleBatch(event.data);
    };

    const handleBatch = (message: BatchMessage) => {
      chunksRef.current.push(message.points);
      if (message.crossings.length > 0) {
        crossingChunksRef.current.push(message.crossings);
        crossingCountRef.current += message.crossings.length / 3;
        onCrossings(message.crossings);
      }

      // Reduced motion: the whole run arrived as one complete batch —
      // render it in a single redraw instead of stroking each segment in
      // as it streams. DESIGN.md §7.
      if (reducedMotion) {
        scheduleRedraw();
      } else {
        const activeCanvas = canvasRef.current;
        const activeCtx = activeCanvas?.getContext('2d');
        if (activeCanvas && activeCtx) {
          const config = {
            rotation: rotationRef.current,
            zoom: zoomRef.current,
            width: activeCanvas.width,
            height: activeCanvas.height,
          };
          drawIncremental(activeCtx, message.points, lastPointRef, TRAJECTORY_COLOR, config);
          for (let i = 0; i + 2 < message.crossings.length; i += 3) {
            const point = message.crossings.subarray(i, i + 3);
            drawMarker(activeCtx, project(point, config), SECTION_COLOR);
          }
        }
      }

      onMetrics({ elapsed: message.elapsed, crossingCount: crossingCountRef.current });
    };

    const startMessage: StartMessage = {
      type: 'start',
      system,
      dt,
      initial: INITIAL_STATE,
      plane,
      reducedMotionSteps: reducedMotion ? REDUCED_MOTION_STEPS : undefined,
    };
    worker.postMessage(startMessage);

    return () => worker.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(system), dt, plane.axis, plane.offset, reducedMotion]);

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
      aria-label={t.canvas.label}
      className="h-full w-full touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onKeyDown={onKeyDown}
    />
  );
}

function drawIncremental(
  ctx: CanvasRenderingContext2D,
  points: Float64Array,
  lastPointRef: React.MutableRefObject<Float64Array | null>,
  color: string,
  config: { rotation: Rotation; zoom: number; width: number; height: number }
): void {
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let i = 0; i + 2 < points.length; i += 3) {
    const point = points.subarray(i, i + 3);
    const screen = project(point, config);
    if (lastPointRef.current) {
      const prevScreen = project(lastPointRef.current, config);
      ctx.beginPath();
      ctx.moveTo(prevScreen.x, prevScreen.y);
      ctx.lineTo(screen.x, screen.y);
      ctx.stroke();
    }
    lastPointRef.current = point;
  }
}
