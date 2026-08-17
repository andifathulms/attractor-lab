// Clifford Pickover attractor. Popularised by Clifford A. Pickover, "Computers, Pattern,
// Chaos and Beauty" (1990). Classic parameters: a=-1.4, b=1.6, c=1.0, d=0.7.

export type CliffordParams = {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
};

export const cliffordClassic: CliffordParams = { a: -1.4, b: 1.6, c: 1.0, d: 0.7 };

/**
 * x' = sin(a y) + c cos(a x)
 * y' = sin(b x) + d cos(b y)
 * Writes into `out`. No integration: the map is its own step.
 */
export function cliffordStep(state: Float64Array, params: CliffordParams, out: Float64Array): void {
  const x = state[0] as number;
  const y = state[1] as number;
  const { a, b, c, d } = params;
  out[0] = Math.sin(a * y) + c * Math.cos(a * x);
  out[1] = Math.sin(b * x) + d * Math.cos(b * y);
}
