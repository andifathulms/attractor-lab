'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Integrator } from '@/lib/dynamics/integrate';
import type { System } from '@/lib/dynamics/systems';
import type { ExportSnapshot } from '@/lib/export/plotter';
import { REDUCED_MOTION_STEPS, usePrefersReducedMotion } from '@/lib/motion';
import { clearBuffer, drawSegment, redrawTrajectory } from '@/lib/render/accumulate';
import { project, type Rotation } from '@/lib/render/projection';
import type {
  BatchMessage,
  MetricsMessage,
  StartMessage,
  WorkerOutboundMessage,
} from '@/workers/integrate.worker';

export type CanvasMetrics = {
  readonly elapsed: number;
  readonly lyapunovMax: number | undefined;
};

export type AttractorCanvasProps = {
  readonly system: System;
  readonly integrator: Integrator;
  readonly dt: number;
  readonly onMetrics: (metrics: CanvasMetrics) => void;
};

export type AttractorCanvasHandle = {
  readonly getSnapshot: () => ExportSnapshot;
};

const TRAIL_COLOR = 'rgba(240, 192, 90, 0.14)';
const INITIAL_STATE: readonly [number, number, number] = [0.1, 0.1, 0.1];
const ZOOM_MIN = 1;
const ZOOM_MAX = 60;
const DRAG_SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

export const AttractorCanvas = forwardRef<AttractorCanvasHandle, AttractorCanvasProps>(
  function AttractorCanvas({ system, integrator, dt, onMetrics }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chunksRef = useRef<Float64Array[]>([]);
    const lastPointRef = useRef<Float64Array | null>(null);
    const rotationRef = useRef<Rotation>({ yaw: 0.6, pitch: -0.3 });
    const zoomRef = useRef(8);
    const draggingRef = useRef(false);
    const lastPointerRef = useRef({ x: 0, y: 0 });
    const redrawPendingRef = useRef(false);
    const lastLyapunovRef = useRef<number | undefined>(undefined);
    const reducedMotion = usePrefersReducedMotion();

    useImperativeHandle(
      ref,
      () => ({
        getSnapshot: () => ({ trajectories: [chunksRef.current], rotation: rotationRef.current }),
      }),
      []
    );

    const scheduleRedraw = () => {
      if (redrawPendingRef.current) return;
      redrawPendingRef.current = true;
      requestAnimationFrame(() => {
        redrawPendingRef.current = false;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        redrawTrajectory(
          ctx,
          chunksRef.current,
          {
            rotation: rotationRef.current,
            zoom: zoomRef.current,
            width: canvas.width,
            height: canvas.height,
          },
          TRAIL_COLOR
        );
      });
    };

    // Re-integrates from scratch and clears the buffer — the only case that clears it.
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      chunksRef.current = [];
      lastPointRef.current = null;
      lastLyapunovRef.current = undefined;
      clearBuffer(ctx, canvas.width, canvas.height);

      const worker = new Worker(new URL('../../workers/integrate.worker.ts', import.meta.url));

      worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
        const message = event.data;
        if (message.type === 'batch') {
          handleBatch(message);
        } else {
          handleMetrics(message);
        }
      };

      const handleBatch = (message: BatchMessage) => {
        chunksRef.current.push(message.points);

        // Reduced motion: the whole trajectory arrived as one complete
        // batch — render it in a single redraw instead of stroking each
        // segment in as it streams in. DESIGN.md §7.
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
            for (let i = 0; i + 2 < message.points.length; i += 3) {
              const point = message.points.subarray(i, i + 3);
              const screen = project(point, config);
              if (lastPointRef.current) {
                const prevScreen = project(lastPointRef.current, config);
                drawSegment(activeCtx, prevScreen, screen, TRAIL_COLOR);
              }
              lastPointRef.current = point;
            }
          }
        }

        onMetrics({ elapsed: message.elapsed, lyapunovMax: lastLyapunovRef.current });
      };

      const handleMetrics = (message: MetricsMessage) => {
        lastLyapunovRef.current = message.lyapunovMax;
        onMetrics({ elapsed: message.elapsed, lyapunovMax: message.lyapunovMax });
      };

      const startMessage: StartMessage = {
        type: 'start',
        system,
        integrator,
        dt,
        initial: INITIAL_STATE,
        reducedMotionSteps: reducedMotion ? REDUCED_MOTION_STEPS : undefined,
      };
      worker.postMessage(startMessage);

      return () => worker.terminate();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(system), JSON.stringify(integrator), dt, reducedMotion]);

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

    return (
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    );
  }
);
