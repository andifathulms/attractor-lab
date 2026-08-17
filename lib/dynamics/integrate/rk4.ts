import type { DerivativeFn } from './euler';

/** Classic RK4: four derivative evaluations per step. Global error O(dt⁴). */
export function rk4Step(state: Float64Array, dt: number, f: DerivativeFn): Float64Array {
  const n = state.length;
  const scratch = new Float64Array(n);

  const k1 = new Float64Array(n);
  f(state, k1);

  for (let i = 0; i < n; i++) {
    scratch[i] = (state[i] as number) + (dt / 2) * (k1[i] as number);
  }
  const k2 = new Float64Array(n);
  f(scratch, k2);

  for (let i = 0; i < n; i++) {
    scratch[i] = (state[i] as number) + (dt / 2) * (k2[i] as number);
  }
  const k3 = new Float64Array(n);
  f(scratch, k3);

  for (let i = 0; i < n; i++) {
    scratch[i] = (state[i] as number) + dt * (k3[i] as number);
  }
  const k4 = new Float64Array(n);
  f(scratch, k4);

  const next = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    next[i] =
      (state[i] as number) +
      (dt / 6) *
        ((k1[i] as number) + 2 * (k2[i] as number) + 2 * (k3[i] as number) + (k4[i] as number));
  }
  return next;
}
