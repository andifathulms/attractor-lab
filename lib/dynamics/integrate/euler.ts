export type DerivativeFn = (state: Float64Array, out: Float64Array) => void;

/** Forward Euler: one derivative evaluation per step. Global error O(dt). */
export function eulerStep(state: Float64Array, dt: number, f: DerivativeFn): Float64Array {
  const n = state.length;
  const k1 = new Float64Array(n);
  f(state, k1);

  const next = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    next[i] = (state[i] as number) + dt * (k1[i] as number);
  }
  return next;
}
