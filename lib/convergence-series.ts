import { eulerStep } from './dynamics/integrate/euler';
import { rk2Step } from './dynamics/integrate/rk2';
import { rk4Step } from './dynamics/integrate/rk4';
import { derivative, type System } from './dynamics/systems';

export type ConvergenceCurve = {
  readonly times: readonly number[];
  readonly eulerVsRk4: readonly number[];
  readonly rk2VsRk4: readonly number[];
};

export type ConvergenceCheckSeries = {
  readonly dt: number;
  /** The two separation curves at the step size currently on screen. */
  readonly before: ConvergenceCurve;
  /** The same two curves at half the step size. */
  readonly after: ConvergenceCurve;
};

function distance(a: Float64Array, b: Float64Array): number {
  let sumSq = 0;
  for (let d = 0; d < 3; d++) {
    const diff = (b[d] as number) - (a[d] as number);
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq);
}

function runCurve(system: System, initial: Float64Array, dt: number, duration: number): ConvergenceCurve {
  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);
  let stateEuler = new Float64Array(initial);
  let stateRk2 = new Float64Array(initial);
  let stateRk4 = new Float64Array(initial);
  const steps = Math.max(1, Math.round(duration / dt));
  const times: number[] = [];
  const eulerVsRk4: number[] = [];
  const rk2VsRk4: number[] = [];
  let elapsed = 0;

  for (let i = 0; i < steps; i++) {
    stateEuler = eulerStep(stateEuler, dt, f);
    stateRk2 = rk2Step(stateRk2, dt, f);
    stateRk4 = rk4Step(stateRk4, dt, f);
    elapsed += dt;
    times.push(elapsed);
    eulerVsRk4.push(distance(stateEuler, stateRk4));
    rk2VsRk4.push(distance(stateRk2, stateRk4));
  }

  return { times, eulerVsRk4, rk2VsRk4 };
}

/**
 * `ComparisonPanel`'s convergence rows report the ratio between an error at
 * `dt` and at `dt/2` as a single number at one endpoint. This computes the
 * same two comparisons — Euler vs RK4, RK2 vs RK4 — as curves over the same
 * short window instead, at both step sizes, so halving the step's effect on
 * the error is a visible vertical gap on the separation plot rather than a
 * number taken on trust. DESIGN-REWORK.md §1.2. `before` and `after` cover
 * the same elapsed-time window by construction (same `duration`, different
 * step count), so they share one time axis with no further alignment.
 */
export function estimateConvergenceSeries(
  system: System,
  initial: Float64Array,
  dt: number,
  duration: number
): ConvergenceCheckSeries {
  return {
    dt,
    before: runCurve(system, initial, dt, duration),
    after: runCurve(system, initial, dt / 2, duration),
  };
}
