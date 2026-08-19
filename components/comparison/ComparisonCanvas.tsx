'use client';

import { useEffect, useRef } from 'react';
import { canvasKeyboardInteraction } from '@/lib/canvas-keyboard';
import type { System } from '@/lib/dynamics/systems';
import { useT } from '@/lib/i18n/LocaleProvider';
import { REDUCED_MOTION_STEPS, usePrefersReducedMotion } from '@/lib/motion';
import { clearBuffer, redrawLayers, type TrajectoryLayer } from '@/lib/render/accumulate';
import { project, type Rotation } from '@/lib/render/projection';
import { TRAIL_COLORS } from '@/lib/render/trail-colors';
import type {
  BatchMessage,
  StartMessage,
  WorkerOutboundMessage,
} from '@/workers/compare.worker';

export type ComparisonMetrics = {
  readonly elapsed: number;
  readonly eulerVsRk4: number;
  readonly rk2VsRk4: number;
};

export type ComparisonCanvasProps = {
  readonly system: System;
  readonly dt: number;
  readonly onMetrics: (metrics: ComparisonMetrics) => void;
  readonly onSeparationBatch?: (
    times: readonly number[],
    eulerVsRk4: readonly number[],
    rk2VsRk4: readonly number[]
  ) => void;
  readonly onReset?: () => void;
};

const INITIAL_STATE: readonly [number, number, number] = [0.1, 0.1, 0.1];
const ZOOM_MIN = 1;
const ZOOM_MAX = 60;
const DRAG_SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

export function ComparisonCanvas({
  system,
  dt,
  onMetrics,
  onSeparationBatch,
  onReset,
}: ComparisonCanvasProps) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chunksEulerRef = useRef<Float64Array[]>([]);
  const chunksRk2Ref = useRef<Float64Array[]>([]);
  const chunksRk4Ref = useRef<Float64Array[]>([]);
  const lastPointEulerRef = useRef<Float64Array | null>(null);
  const lastPointRk2Ref = useRef<Float64Array | null>(null);
  const lastPointRk4Ref = useRef<Float64Array | null>(null);
  const rotationRef = useRef<Rotation>({ yaw: 0.6, pitch: -0.3 });
  const zoomRef = useRef(8);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const redrawPendingRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  const layers = (): TrajectoryLayer[] => [
    { chunks: chunksRk4Ref.current, color: TRAIL_COLORS.rk4 },
    { chunks: chunksRk2Ref.current, color: TRAIL_COLORS.rk2 },
    { chunks: chunksEulerRef.current, color: TRAIL_COLORS.euler },
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

    chunksEulerRef.current = [];
    chunksRk2Ref.current = [];
    chunksRk4Ref.current = [];
    lastPointEulerRef.current = null;
    lastPointRk2Ref.current = null;
    lastPointRk4Ref.current = null;
    clearBuffer(ctx, canvas.width, canvas.height);
    onReset?.();

    const worker = new Worker(new URL('../../workers/compare.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      handleBatch(event.data);
    };

    const handleBatch = (message: BatchMessage) => {
      chunksEulerRef.current.push(message.pointsEuler);
      chunksRk2Ref.current.push(message.pointsRk2);
      chunksRk4Ref.current.push(message.pointsRk4);

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
          drawIncremental(activeCtx, message.pointsRk4, lastPointRk4Ref, TRAIL_COLORS.rk4, config);
          drawIncremental(activeCtx, message.pointsRk2, lastPointRk2Ref, TRAIL_COLORS.rk2, config);
          drawIncremental(activeCtx, message.pointsEuler, lastPointEulerRef, TRAIL_COLORS.euler, config);
        }
      }

      const lastEulerVsRk4 = message.eulerVsRk4[message.eulerVsRk4.length - 1] as number;
      const lastRk2VsRk4 = message.rk2VsRk4[message.rk2VsRk4.length - 1] as number;
      onMetrics({
        elapsed: message.elapsed,
        eulerVsRk4: lastEulerVsRk4,
        rk2VsRk4: lastRk2VsRk4,
      });
      onSeparationBatch?.(
        Array.from(message.times),
        Array.from(message.eulerVsRk4),
        Array.from(message.rk2VsRk4)
      );
    };

    const startMessage: StartMessage = {
      type: 'start',
      system,
      dt,
      initial: INITIAL_STATE,
      reducedMotionSteps: reducedMotion ? REDUCED_MOTION_STEPS : undefined,
    };
    worker.postMessage(startMessage);

    return () => worker.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(system), dt, reducedMotion]);

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
