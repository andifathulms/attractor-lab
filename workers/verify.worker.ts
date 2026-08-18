import type { Integrator } from '../lib/dynamics/integrate';
import type { System } from '../lib/dynamics/systems';
import { integrateTrajectory } from '../lib/dynamics/trajectory';

export type StartMessage = {
  readonly type: 'start';
  readonly system: System;
  readonly integrator: Integrator;
  readonly initial: readonly [number, number, number];
  readonly dt: number;
  /** Steps taken so far at `dt` — re-run at `dt` and at `dt/2` (2x the steps) to cover the same elapsed time. */
  readonly steps: number;
};

export type WorkerInboundMessage = StartMessage;

export type ResultMessage = {
  readonly type: 'result';
  /** Euclidean distance between the endpoint at `dt` and the endpoint at `dt/2`, same elapsed time. */
  readonly delta: number;
};

export type WorkerOutboundMessage = ResultMessage;

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const message = event.data;
  if (message.type !== 'start') return;
  const { system, integrator, initial, dt, steps } = message;

  const atDt = integrateTrajectory(system, integrator, new Float64Array(initial), dt, steps);
  const atHalfDt = integrateTrajectory(system, integrator, new Float64Array(initial), dt / 2, steps * 2);

  const pAtDt = atDt[atDt.length - 1] as Float64Array;
  const pAtHalfDt = atHalfDt[atHalfDt.length - 1] as Float64Array;

  let sumSq = 0;
  for (let d = 0; d < 3; d++) {
    const diff = (pAtHalfDt[d] as number) - (pAtDt[d] as number);
    sumSq += diff * diff;
  }

  const resultMessage: ResultMessage = { type: 'result', delta: Math.sqrt(sumSq) };
  (self as unknown as Worker).postMessage(resultMessage);
};

export {};
