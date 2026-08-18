import type { DerivativeFn } from './integrate';
import { eulerStep } from './integrate/euler';
import { rk2Step } from './integrate/rk2';
import { rk4Step } from './integrate/rk4';
import { derivative, type System } from './systems';

/** The order plus the two intermediate error magnitudes it's derived from — shown together so the ratio is checkable, not just its conclusion. */
export type ConvergenceResult = {
  readonly order: number;
  readonly errorCoarse: number;
  readonly errorFine: number;
};

export type ConvergenceOrders = {
  readonly euler: ConvergenceResult;
  readonly rk2: ConvergenceResult;
  readonly rk4: ConvergenceResult;
};

type StepFn = (state: Float64Array, dt: number, f: DerivativeFn) => Float64Array;

function integrate(stepFn: StepFn, initial: Float64Array, dt: number, duration: number, f: DerivativeFn): Float64Array {
  let state = new Float64Array(initial);
  const steps = Math.round(duration / dt);
  for (let i = 0; i < steps; i++) state = stepFn(state, dt, f);
  return state;
}

function distance(a: Float64Array, b: Float64Array): number {
  let sumSq = 0;
  for (let d = 0; d < 3; d++) {
    const diff = (a[d] as number) - (b[d] as number);
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq);
}

/**
 * Observed convergence order for each integrator over a short window, short
 * enough that the trajectory hasn't yet diverged exponentially between the
 * two step sizes compared — this measures local truncation behaviour, not
 * chaos. Halving dt should shrink Euler's error by ≈2, RK2's by ≈4, RK4's
 * by ≈16 (log₂ of the error ratio ≈1, 2, 4 respectively). PRD.md §4.3.
 */
export function estimateConvergenceOrders(
  system: System,
  initial: Float64Array,
  dt: number,
  duration: number
): ConvergenceOrders {
  const f: DerivativeFn = (state, out) => derivative(system, state, out);
  const reference = integrate(rk4Step, initial, dt / 64, duration, f);

  const resultFor = (stepFn: StepFn): ConvergenceResult => {
    const coarse = integrate(stepFn, initial, dt, duration, f);
    const fine = integrate(stepFn, initial, dt / 2, duration, f);
    const errorCoarse = distance(coarse, reference);
    const errorFine = distance(fine, reference);
    const order = errorFine === 0 ? Infinity : Math.log2(errorCoarse / errorFine);
    return { order, errorCoarse, errorFine };
  };

  return {
    euler: resultFor(eulerStep),
    rk2: resultFor(rk2Step),
    rk4: resultFor(rk4Step),
  };
}
