// Halvorsen attractor, popularised by Julien C. Sprott and Paul Bourke; cyclically symmetric.
// Classic parameter: a = 1.4.

export type HalvorsenParams = {
  readonly a: number;
};

export const halvorsenClassic: HalvorsenParams = { a: 1.4 };

/**
 * ẋ = −ax−4y−4z−y², ẏ = −ay−4z−4x−z², ż = −az−4x−4y−x².
 * Writes into `out`, never allocates.
 */
export function halvorsenDerivative(
  state: Float64Array,
  params: HalvorsenParams,
  out: Float64Array
): void {
  const x = state[0] as number;
  const y = state[1] as number;
  const z = state[2] as number;
  const { a } = params;
  out[0] = -a * x - 4 * y - 4 * z - y * y;
  out[1] = -a * y - 4 * z - 4 * x - z * z;
  out[2] = -a * z - 4 * x - 4 * y - x * x;
}
