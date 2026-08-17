// Rössler, O. E. (1976). "An Equation for Continuous Chaos". Phys. Lett. A 57(5), 397–398.
// Classic parameters: a = b = 0.2, c = 5.7.

export type RosslerParams = {
  readonly a: number;
  readonly b: number;
  readonly c: number;
};

export const rosslerClassic: RosslerParams = { a: 0.2, b: 0.2, c: 5.7 };

/** ẋ = −y−z, ẏ = x+ay, ż = b+z(x−c). Writes into `out`, never allocates. */
export function rosslerDerivative(
  state: Float64Array,
  params: RosslerParams,
  out: Float64Array
): void {
  const x = state[0] as number;
  const y = state[1] as number;
  const z = state[2] as number;
  const { a, b, c } = params;
  out[0] = -y - z;
  out[1] = x + a * y;
  out[2] = b + z * (x - c);
}
