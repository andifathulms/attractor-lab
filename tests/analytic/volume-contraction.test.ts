import { describe, expect, it } from 'vitest';
import { rk4Step } from '../../lib/dynamics/integrate/rk4';
import { derivative } from '../../lib/dynamics/systems';
import { invariants } from '../../lib/dynamics/invariants';

/** Volume of the parallelepiped spanned by three edge vectors from a common vertex. */
function tetrahedronVolume(v0: Float64Array, v1: Float64Array, v2: Float64Array, v3: Float64Array): number {
  const a = [v1[0]! - v0[0]!, v1[1]! - v0[1]!, v1[2]! - v0[2]!];
  const b = [v2[0]! - v0[0]!, v2[1]! - v0[1]!, v2[2]! - v0[2]!];
  const c = [v3[0]! - v0[0]!, v3[1]! - v0[1]!, v3[2]! - v0[2]!];
  const cross = [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];
  const det = cross[0]! * c[0]! + cross[1]! * c[1]! + cross[2]! * c[2]!;
  return Math.abs(det) / 6;
}

describe('Lorenz phase-space volume contraction', () => {
  it('contracts at the analytic rate e^{-(sigma+1+beta) t}', () => {
    const params = { sigma: 10, rho: 28, beta: 8 / 3 };
    const system = { type: 'lorenz' as const, params };
    const f = (s: Float64Array, out: Float64Array): void => derivative(system, s, out);

    const divergence = invariants.lorenz?.divergence(params, new Float64Array([1, 1, 1])) ?? 0;
    expect(divergence).toBeCloseTo(-(params.sigma + 1 + params.beta), 10);

    // Burn in to a point on the attractor: starting the ensemble off-attractor
    // stretches the simplex through the transient and swamps the linear
    // (infinitesimal) approximation the volume-ratio check depends on.
    let seed = new Float64Array([1, 1, 20]);
    for (let i = 0; i < 5000; i++) seed = rk4Step(seed, 0.005, f);

    const eps = 1e-5;
    let v0 = new Float64Array(seed);
    let v1 = new Float64Array(seed);
    v1[0] = (v1[0] as number) + eps;
    let v2 = new Float64Array(seed);
    v2[1] = (v2[1] as number) + eps;
    let v3 = new Float64Array(seed);
    v3[2] = (v3[2] as number) + eps;

    const v0Initial = tetrahedronVolume(v0, v1, v2, v3);

    const dt = 0.0005;
    const steps = 100; // t = 0.05 — short enough that the simplex stays near-linear
    for (let i = 0; i < steps; i++) {
      v0 = rk4Step(v0, dt, f);
      v1 = rk4Step(v1, dt, f);
      v2 = rk4Step(v2, dt, f);
      v3 = rk4Step(v3, dt, f);
    }

    const vFinal = tetrahedronVolume(v0, v1, v2, v3);
    const observedRatio = vFinal / v0Initial;
    const expectedRatio = Math.exp(divergence * dt * steps);

    expect(Math.log(observedRatio) / Math.log(expectedRatio)).toBeCloseTo(1, 2);
  });
});
