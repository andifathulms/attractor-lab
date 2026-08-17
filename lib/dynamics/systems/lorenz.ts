// Lorenz, E. N. (1963). "Deterministic Nonperiodic Flow". J. Atmos. Sci. 20(2), 130–141.
// Classic parameters: sigma = 10, rho = 28, beta = 8/3.

export type LorenzParams = {
  readonly sigma: number;
  readonly rho: number;
  readonly beta: number;
};

export const lorenzClassic: LorenzParams = { sigma: 10, rho: 28, beta: 8 / 3 };

/** ẋ = σ(y−x), ẏ = x(ρ−z)−y, ż = xy−βz. Writes into `out`, never allocates. */
export function lorenzDerivative(
  state: Float64Array,
  params: LorenzParams,
  out: Float64Array
): void {
  const x = state[0] as number;
  const y = state[1] as number;
  const z = state[2] as number;
  const { sigma, rho, beta } = params;
  out[0] = sigma * (y - x);
  out[1] = x * (rho - z) - y;
  out[2] = x * y - beta * z;
}
