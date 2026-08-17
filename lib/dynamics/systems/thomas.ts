// Thomas, R. (1999). "Deterministic Chaos Seen in Terms of Feedback Circuits".
// Int. J. Bifurcation Chaos 9(10), 1889–1905. Cyclically symmetric.
// Classic parameter: b = 0.208186.

export type ThomasParams = {
  readonly b: number;
};

export const thomasClassic: ThomasParams = { b: 0.208186 };

/** ẋ = sin(y)−bx, ẏ = sin(z)−by, ż = sin(x)−bz. Writes into `out`, never allocates. */
export function thomasDerivative(
  state: Float64Array,
  params: ThomasParams,
  out: Float64Array
): void {
  const x = state[0] as number;
  const y = state[1] as number;
  const z = state[2] as number;
  const { b } = params;
  out[0] = Math.sin(y) - b * x;
  out[1] = Math.sin(z) - b * y;
  out[2] = Math.sin(x) - b * z;
}
