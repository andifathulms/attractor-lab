import { describe, expect, it } from 'vitest';
import { eulerStep } from '../../lib/dynamics/integrate/euler';
import { rk2Step } from '../../lib/dynamics/integrate/rk2';
import { rk4Step } from '../../lib/dynamics/integrate/rk4';
import { derivative } from '../../lib/dynamics/systems';
import type { DerivativeFn } from '../../lib/dynamics/integrate';

const params = { sigma: 10, rho: 28, beta: 8 / 3 };
const system = { type: 'lorenz' as const, params };
const f: DerivativeFn = (s, out) => derivative(system, s, out);

/** Integrates from `initial` over `duration` with a fixed `dt`, using `stepFn`. */
function integrate(
  stepFn: (state: Float64Array, dt: number, f: DerivativeFn) => Float64Array,
  initial: Float64Array,
  dt: number,
  duration: number
): Float64Array {
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

describe('convergence order', () => {
  // Short duration so the trajectory hasn't yet diverged exponentially between
  // the two step sizes — this measures local truncation behaviour, not chaos.
  const initial = new Float64Array([1, 1, 1]);
  const duration = 0.2;
  const dt = 0.01;

  it.each([
    { name: 'euler', stepFn: eulerStep, expectedOrder: 1 },
    { name: 'rk2', stepFn: rk2Step, expectedOrder: 2 },
    { name: 'rk4', stepFn: rk4Step, expectedOrder: 4 },
  ])('$name: halving dt shrinks global error by ≈2^$expectedOrder', ({ stepFn, expectedOrder }) => {
    // Reference solution at a much finer step, standing in for the true trajectory.
    const reference = integrate(rk4Step, initial, dt / 64, duration);

    const coarse = integrate(stepFn, initial, dt, duration);
    const fine = integrate(stepFn, initial, dt / 2, duration);

    const errorCoarse = distance(coarse, reference);
    const errorFine = distance(fine, reference);

    const observedOrder = Math.log2(errorCoarse / errorFine);
    expect(observedOrder).toBeCloseTo(expectedOrder, 0);
  });
});
