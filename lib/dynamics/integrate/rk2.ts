import type { DerivativeFn } from './euler';

/** Midpoint-method RK2: two derivative evaluations per step. Global error O(dt²). */
export function rk2Step(state: Float64Array, dt: number, f: DerivativeFn): Float64Array {
  const n = state.length;
  const k1 = new Float64Array(n);
  f(state, k1);

  const mid = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    mid[i] = (state[i] as number) + (dt / 2) * (k1[i] as number);
  }

  const k2 = new Float64Array(n);
  f(mid, k2);

  const next = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    next[i] = (state[i] as number) + dt * (k2[i] as number);
  }
  return next;
}
