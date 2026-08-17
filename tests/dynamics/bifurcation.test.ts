import { describe, expect, it } from 'vitest';
import { localMaxima } from '../../lib/dynamics/bifurcation';
import { classicSystem } from '../../lib/dynamics/systems';

describe('localMaxima', () => {
  it('finds many local maxima of z on the classic chaotic Lorenz attractor', () => {
    const maxima = localMaxima(classicSystem.lorenz, new Float64Array([1, 1, 1]), {
      dt: 0.005,
      burnInSteps: 2000,
      sampleSteps: 20000,
      axis: 2,
    });

    expect(maxima.length).toBeGreaterThan(10);
    // Every reported value must actually be within the trajectory's bounded range.
    for (const value of maxima) {
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThan(60);
    }
  });

  it('finds essentially no maxima once the trajectory has settled at a stable fixed point', () => {
    const params = { sigma: 10, rho: 0.5, beta: 8 / 3 };
    const maxima = localMaxima(
      { type: 'lorenz', params },
      new Float64Array([0.1, 0.1, 0.1]),
      { dt: 0.005, burnInSteps: 5000, sampleSteps: 5000, axis: 2 }
    );

    expect(maxima.length).toBeLessThan(3);
  });
});
