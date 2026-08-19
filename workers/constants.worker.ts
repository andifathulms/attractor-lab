import { invariants } from '../lib/dynamics/invariants';
import { kaplanYorkeDimension, largestLyapunovExponent, lyapunovSpectrum } from '../lib/dynamics/lyapunov';
import { classicSystem, type SystemId } from '../lib/dynamics/systems';
import { BIFURCATION_INITIAL_STATE } from '../lib/initial-state';

export type StartMessage = {
  readonly type: 'start';
  readonly systemId: SystemId;
};

export type WorkerInboundMessage = StartMessage;

export type ResultMessage = {
  readonly type: 'result';
  readonly lyapunovMax: number | undefined;
  readonly kaplanYorkeDimension: number | undefined;
};

export type WorkerOutboundMessage = ResultMessage;

// Same step and run length as tests/constants/lorenz.test.ts — this is the
// CI-gating check's method, run live, not a separate estimate that could
// quietly drift from what the suite actually asserts. The initial condition
// itself is BIFURCATION_INITIAL_STATE rather than the test's own [1, 1, 1]:
// a Lyapunov exponent is an ergodic average and doesn't depend on which
// generic point it starts from, but [1, 1, 1] is exactly the fixed point
// Thomas and Halvorsen collapse to (lib/initial-state.ts) and this worker
// runs for every system, not just Lorenz.
const DT = 0.005;
const LYAPUNOV_STEPS = 160000;
const SPECTRUM_STEPS = 40000;

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const message = event.data;
  if (message.type !== 'start') return;

  const system = classicSystem[message.systemId];
  const published = invariants[message.systemId]?.published ?? {};

  const lyapunovMax =
    published.lyapunovMax !== undefined
      ? largestLyapunovExponent(system, { type: 'rk4' }, new Float64Array(BIFURCATION_INITIAL_STATE), DT, LYAPUNOV_STEPS)
      : undefined;

  let dimension: number | undefined;
  if (published.kaplanYorkeDimension !== undefined) {
    const spectrum = lyapunovSpectrum(system, { type: 'rk4' }, new Float64Array(BIFURCATION_INITIAL_STATE), DT, SPECTRUM_STEPS);
    dimension = kaplanYorkeDimension(spectrum);
  }

  const resultMessage: ResultMessage = { type: 'result', lyapunovMax, kaplanYorkeDimension: dimension };
  (self as unknown as Worker).postMessage(resultMessage);
};

export {};
