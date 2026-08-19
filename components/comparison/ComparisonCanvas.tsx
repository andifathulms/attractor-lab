'use client';

import { useEffect, useRef } from 'react';
import { TrajectoryCanvas, type TrajectoryCanvasHandle } from '@/components/canvas/TrajectoryCanvas';
import type { System } from '@/lib/dynamics/systems';
import { useT } from '@/lib/i18n/LocaleProvider';
import { REDUCED_MOTION_STEPS, usePrefersReducedMotion } from '@/lib/motion';
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
const TRAJECTORY_EULER = 'euler';
const TRAJECTORY_RK2 = 'rk2';
const TRAJECTORY_RK4 = 'rk4';

export function ComparisonCanvas({
  system,
  dt,
  onMetrics,
  onSeparationBatch,
  onReset,
}: ComparisonCanvasProps) {
  const t = useT();
  const canvasRef = useRef<TrajectoryCanvasHandle | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Re-integrates from scratch and clears the buffer — the only case that clears it.
  useEffect(() => {
    canvasRef.current?.clear();
    onReset?.();

    const worker = new Worker(new URL('../../workers/compare.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      handleBatch(event.data);
    };

    const handleBatch = (message: BatchMessage) => {
      // RK4 is the reference every render implicitly trusts elsewhere in
      // this app, drawn first (bottom). Euler is the one that visibly
      // departs first, drawn last (top).
      canvasRef.current?.pushPoints(TRAJECTORY_RK4, message.pointsRk4);
      canvasRef.current?.pushPoints(TRAJECTORY_RK2, message.pointsRk2);
      canvasRef.current?.pushPoints(TRAJECTORY_EULER, message.pointsEuler);

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

  return (
    <TrajectoryCanvas
      ref={canvasRef}
      trajectories={[
        { id: TRAJECTORY_RK4, color: TRAIL_COLORS.rk4 },
        { id: TRAJECTORY_RK2, color: TRAIL_COLORS.rk2 },
        { id: TRAJECTORY_EULER, color: TRAIL_COLORS.euler },
      ]}
      ariaLabel={t.canvas.label}
    />
  );
}
