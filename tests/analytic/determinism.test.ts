import { describe, expect, it } from 'vitest';
import { integrateTrajectory } from '../../lib/dynamics/trajectory';
import { classicSystem } from '../../lib/dynamics/systems';

describe('determinism', () => {
  it('produces a byte-identical trajectory for identical inputs', () => {
    const system = classicSystem.lorenz;
    const initial = new Float64Array([1, 1, 1]);

    const a = integrateTrajectory(system, { type: 'rk4' }, initial, 0.01, 1000);
    const b = integrateTrajectory(system, { type: 'rk4' }, initial, 0.01, 1000);

    expect(a.length).toBe(b.length);
    for (let i = 0; i < a.length; i++) {
      const sa = a[i] as Float64Array;
      const sb = b[i] as Float64Array;
      for (let d = 0; d < 3; d++) {
        expect(sa[d]).toBe(sb[d]);
      }
    }
  });
});
