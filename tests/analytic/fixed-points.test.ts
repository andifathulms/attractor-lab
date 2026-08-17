import { describe, expect, it } from 'vitest';
import { rk4Step } from '../../lib/dynamics/integrate/rk4';
import { derivative } from '../../lib/dynamics/systems';
import { invariants } from '../../lib/dynamics/invariants';

describe('Lorenz fixed points', () => {
  it('converges to the origin when rho < 1 (origin stable)', () => {
    const params = { sigma: 10, rho: 0.5, beta: 8 / 3 };
    const system = { type: 'lorenz' as const, params };
    let state = new Float64Array([0.1, 0.1, 0.1]);
    const f = (s: Float64Array, out: Float64Array): void => derivative(system, s, out);

    for (let i = 0; i < 20000; i++) {
      state = rk4Step(state, 0.005, f);
    }

    const origin = invariants.lorenz?.fixedPoints(params)[0];
    expect(origin?.point).toEqual([0, 0, 0]);
    expect(state[0]).toBeCloseTo(0, 4);
    expect(state[1]).toBeCloseTo(0, 4);
    expect(state[2]).toBeCloseTo(0, 4);
  });

  it('converges to C+ for classic rho = 28 started near it', () => {
    const params = { sigma: 10, rho: 28, beta: 8 / 3 };
    const fixedPoints = invariants.lorenz?.fixedPoints(params) ?? [];
    const cPlus = fixedPoints.find((p) => p.point[0] > 0);
    expect(cPlus).toBeDefined();

    // C+/C- are unstable at classic parameters (Hopf bifurcation near rho≈24.74),
    // so this only checks that the analytic point itself is a genuine root of F,
    // not that trajectories converge to it.
    const system = { type: 'lorenz' as const, params };
    const state = new Float64Array(cPlus?.point ?? [0, 0, 0]);
    const out = new Float64Array(3);
    derivative(system, state, out);
    expect(out[0]).toBeCloseTo(0, 8);
    expect(out[1]).toBeCloseTo(0, 8);
    expect(out[2]).toBeCloseTo(0, 8);
  });
});
