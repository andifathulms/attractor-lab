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

const TRAJECTORY_ID = 'attractor';

export const AttractorCanvas = forwardRef<AttractorCanvasHandle, AttractorCanvasProps>(
  function AttractorCanvas({ system, integrator, dt, onMetrics }, ref) {
    const t = useT();
    const canvasRef = useRef<TrajectoryCanvasHandle | null>(null);
    const lastLyapunovRef = useRef<number | undefined>(undefined);
    const reducedMotion = usePrefersReducedMotion();

    useImperativeHandle(
      ref,
      () => ({
        getSnapshot: () =>
          canvasRef.current?.getSnapshot() ?? { trajectories: [[]], rotation: { yaw: 0, pitch: 0 } },
      }),
      []
    );

    // Re-integrates from scratch and clears the buffer — the only case that clears it.
    useEffect(() => {
      canvasRef.current?.clear();
      lastLyapunovRef.current = undefined;

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
        canvasRef.current?.pushPoints(TRAJECTORY_ID, message.points);
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

    return (
      <TrajectoryCanvas
        ref={canvasRef}
        trajectories={[{ id: TRAJECTORY_ID, color: TRAIL_COLORS.trailA }]}
        ariaLabel={t.canvas.label}
      />
    );
  }
);
