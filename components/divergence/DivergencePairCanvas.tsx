'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Integrator } from '@/lib/dynamics/integrate';
import type { System } from '@/lib/dynamics/systems';
import type { ExportSnapshot } from '@/lib/export/plotter';
import { REDUCED_MOTION_STEPS, usePrefersReducedMotion } from '@/lib/motion';
import { clearBuffer, redrawLayers, type TrajectoryLayer } from '@/lib/render/accumulate';
import { project, type Rotation } from '@/lib/render/projection';
import type {
  BatchMessage,
  MetricsMessage,
  StartMessage,
  WorkerOutboundMessage,
} from '@/workers/divergence.worker';

export type DivergenceMetrics = {
  readonly elapsed: number;
  readonly lyapunovMax: number | undefined;
};

export type DivergencePairCanvasProps = {
  readonly system: System;
  readonly integrator: Integrator;
  readonly dt: number;
  readonly epsilon: number;
  readonly onMetrics: (metrics: DivergenceMetrics) => void;
  readonly onSeparationBatch: (times: readonly number[], separations: readonly number[]) => void;
  readonly onReset: () => void;
};

export type DivergencePairCanvasHandle = {
  readonly getSnapshot: () => ExportSnapshot;
};

const TRAIL_A = 'rgba(240, 192, 90, 0.14)';
const TRAIL_B = 'rgba(95, 176, 217, 0.14)';
const INITIAL_STATE: readonly [number, number, number] = [0.1, 0.1, 0.1];
const ZOOM_MIN = 1;
const ZOOM_MAX = 60;
const DRAG_SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

export const DivergencePairCanvas = forwardRef<
  DivergencePairCanvasHandle,
  DivergencePairCanvasProps
>(function DivergencePairCanvas(
  { system, integrator, dt, epsilon, onMetrics, onSeparationBatch, onReset },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunksARef = useRef<Float64Array[]>([]);
  const chunksBRef = useRef<Float64Array[]>([]);
  const lastPointARef = useRef<Float64Array | null>(null);
  const lastPointBRef = useRef<Float64Array | null>(null);
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
      getSnapshot: () => ({
        trajectories: [chunksARef.current, chunksBRef.current],
        rotation: rotationRef.current,
      }),
    }),
    []
  );

  const layers = (): TrajectoryLayer[] => [
    { chunks: chunksARef.current, color: TRAIL_A },
    { chunks: chunksBRef.current, color: TRAIL_B },
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

    chunksARef.current = [];
    chunksBRef.current = [];
    lastPointARef.current = null;
    lastPointBRef.current = null;
    lastLyapunovRef.current = undefined;
    clearBuffer(ctx, canvas.width, canvas.height);
    onReset();

    const worker = new Worker(new URL('../../workers/divergence.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const message = event.data;
      if (message.type === 'batch') {
        handleBatch(message);
      } else {
        handleMetrics(message);
      }
    };

    const handleBatch = (message: BatchMessage) => {
      chunksARef.current.push(message.pointsA);
      chunksBRef.current.push(message.pointsB);

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
          drawIncremental(activeCtx, message.pointsA, lastPointARef, TRAIL_A, config);
          drawIncremental(activeCtx, message.pointsB, lastPointBRef, TRAIL_B, config);
        }
      }

      onSeparationBatch(Array.from(message.times), Array.from(message.separations));
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
      epsilon,
      reducedMotionSteps: reducedMotion ? REDUCED_MOTION_STEPS : undefined,
    };
    worker.postMessage(startMessage);

    return () => worker.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(system), JSON.stringify(integrator), dt, epsilon, reducedMotion]);

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
});

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
