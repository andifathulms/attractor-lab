// Peter de Jong attractor. Popularised via Paul Bourke's map galleries.
// Classic parameters: a=1.4, b=-2.3, c=2.4, d=-2.1.

export type DeJongParams = {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
};

export const deJongClassic: DeJongParams = { a: 1.4, b: -2.3, c: 2.4, d: -2.1 };

/**
 * x' = sin(a y) − cos(b x)
 * y' = sin(c x) − cos(d y)
 * Writes into `out`. No integration: the map is its own step.
 */
export function deJongStep(state: Float64Array, params: DeJongParams, out: Float64Array): void {
  const x = state[0] as number;
  const y = state[1] as number;
  const { a, b, c, d } = params;
  out[0] = Math.sin(a * y) - Math.cos(b * x);
  out[1] = Math.sin(c * x) - Math.cos(d * y);
}
