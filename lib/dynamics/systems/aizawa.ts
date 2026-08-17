// Aizawa attractor, popularised by Julien C. Sprott (after Aizawa & Uezu's chaotic-circuit work, 1982).
// Classic parameters: a=0.95, b=0.7, c=0.6, d=3.5, e=0.25, f=0.1.

export type AizawaParams = {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
  readonly f: number;
};

export const aizawaClassic: AizawaParams = {
  a: 0.95,
  b: 0.7,
  c: 0.6,
  d: 3.5,
  e: 0.25,
  f: 0.1,
};

/**
 * ẋ = (z−b)x − dy
 * ẏ = dx + (z−b)y
 * ż = c + az − z³/3 − (x²+y²)(1+ez) + f z x³
 * Writes into `out`, never allocates.
 */
export function aizawaDerivative(
  state: Float64Array,
  params: AizawaParams,
  out: Float64Array
): void {
  const x = state[0] as number;
  const y = state[1] as number;
  const z = state[2] as number;
  const { a, b, c, d, e, f } = params;
  out[0] = (z - b) * x - d * y;
  out[1] = d * x + (z - b) * y;
  out[2] =
    c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x;
}
