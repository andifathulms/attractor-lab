'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { TrajectoryCanvas, type TrajectoryCanvasHandle } from '@/components/canvas/TrajectoryCanvas';
import type { Integrator } from '@/lib/dynamics/integrate';
import type { System } from '@/lib/dynamics/systems';
import type { ExportSnapshot } from '@/lib/export/plotter';
import { useT } from '@/lib/i18n/LocaleProvider';
import { INITIAL_STATE } from '@/lib/initial-state';
import { REDUCED_MOTION_STEPS, usePrefersReducedMotion } from '@/lib/motion';
import { TRAIL_COLORS } from '@/lib/render/trail-colors';
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
  /** A trajectory escaped its bounding region, or the worker itself failed — CLAUDE.md invariant 12. */
  readonly onError?: () => void;
};

export type DivergencePairCanvasHandle = {
  readonly getSnapshot: () => ExportSnapshot;
};

const TRAJECTORY_A = 'a';
const TRAJECTORY_B = 'b';

export const DivergencePairCanvas = forwardRef<
  DivergencePairCanvasHandle,
  DivergencePairCanvasProps
>(function DivergencePairCanvas(
  { system, integrator, dt, epsilon, onMetrics, onSeparationBatch, onReset, onError },
  ref
) {
  const t = useT();
  const canvasRef = useRef<TrajectoryCanvasHandle | null>(null);
  const lastLyapunovRef = useRef<number | undefined>(undefined);
  const workerRef = useRef<Worker | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useImperativeHandle(
    ref,
    () => ({
      getSnapshot: () =>
        canvasRef.current?.getSnapshot() ?? { trajectories: [[], []], rotation: { yaw: 0, pitch: 0 } },
    }),
    []
  );

  // Re-integrates from scratch and clears the buffer — the only case that clears it.
  useEffect(() => {
    canvasRef.current?.clear();
    lastLyapunovRef.current = undefined;
    onReset();

    const worker = new Worker(new URL('../../workers/divergence.worker.ts', import.meta.url));
    workerRef.current = worker;

    worker.onerror = () => onError?.();

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const message = event.data;
      if (message.type === 'batch') {
        handleBatch(message);
      } else {
        handleMetrics(message);
      }
    };

    const handleBatch = (message: BatchMessage) => {
      canvasRef.current?.pushPoints(TRAJECTORY_A, message.pointsA);
      canvasRef.current?.pushPoints(TRAJECTORY_B, message.pointsB);

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

  const handleEscape = () => {
    workerRef.current?.terminate();
    onError?.();
  };

  return (
    <TrajectoryCanvas
      ref={canvasRef}
      trajectories={[
        { id: TRAJECTORY_A, color: TRAIL_COLORS.trailA },
        { id: TRAJECTORY_B, color: TRAIL_COLORS.trailB },
      ]}
      ariaLabel={t.canvas.label}
      onEscape={handleEscape}
    />
  );
});
