import { describe, expect, it } from 'vitest';
import { integrateTrajectory } from '../../lib/dynamics/trajectory';
import { classicSystem } from '../../lib/dynamics/systems';
import { invariants } from '../../lib/dynamics/invariants';

describe('boundedness under classic parameters', () => {
  it.each(['lorenz', 'rossler'] as const)('%s stays inside its bounding box over a long run', (id) => {
    const system = classicSystem[id];
    const box = invariants[id]?.boundingBox;
    expect(box).toBeDefined();

    const trajectory = integrateTrajectory(
      system,
      { type: 'rk4' },
      new Float64Array([0.1, 0.1, 0.1]),
      0.005,
      50000
    );

    for (const state of trajectory) {
      expect(state[0]).toBeGreaterThanOrEqual(box!.min[0]);
      expect(state[0]).toBeLessThanOrEqual(box!.max[0]);
      expect(state[1]).toBeGreaterThanOrEqual(box!.min[1]);
      expect(state[1]).toBeLessThanOrEqual(box!.max[1]);
      expect(state[2]).toBeGreaterThanOrEqual(box!.min[2]);
      expect(state[2]).toBeLessThanOrEqual(box!.max[2]);
    }
  });
});
