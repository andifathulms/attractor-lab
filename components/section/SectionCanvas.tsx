'use client';

import { useEffect, useRef } from 'react';
import { TrajectoryCanvas, type TrajectoryCanvasHandle } from '@/components/canvas/TrajectoryCanvas';
import type { Plane } from '@/lib/dynamics/section';
import type { System } from '@/lib/dynamics/systems';
import { useT } from '@/lib/i18n/LocaleProvider';
import { REDUCED_MOTION_STEPS, usePrefersReducedMotion } from '@/lib/motion';
import { TRAIL_COLORS } from '@/lib/render/trail-colors';
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

const INITIAL_STATE: readonly [number, number, number] = [0.1, 0.1, 0.1];
const TRAJECTORY_ID = 'section';

export function SectionCanvas({ system, dt, plane, onMetrics, onCrossings }: SectionCanvasProps) {
  const t = useT();
  const canvasRef = useRef<TrajectoryCanvasHandle | null>(null);
  const crossingCountRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  // Re-integrates from scratch and clears the buffer — the only case that clears it.
  useEffect(() => {
    canvasRef.current?.clear();
    crossingCountRef.current = 0;

    const worker = new Worker(new URL('../../workers/section.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      handleBatch(event.data);
    };

    const handleBatch = (message: BatchMessage) => {
      canvasRef.current?.pushPoints(TRAJECTORY_ID, message.points);
      if (message.crossings.length > 0) {
        canvasRef.current?.pushMarkers(message.crossings);
        crossingCountRef.current += message.crossings.length / 3;
        onCrossings(message.crossings);
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

  return (
    <TrajectoryCanvas
      ref={canvasRef}
      trajectories={[{ id: TRAJECTORY_ID, color: TRAIL_COLORS.sectionTrajectory }]}
      markerColor={TRAIL_COLORS.section}
      ariaLabel={t.canvas.sectionLabel}
    />
  );
}
