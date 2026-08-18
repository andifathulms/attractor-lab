import { describe, expect, it } from 'vitest';
import { estimateConvergenceOrders } from '../../lib/dynamics/convergence';

describe('estimateConvergenceOrders', () => {
  const system = { type: 'lorenz' as const, params: { sigma: 10, rho: 28, beta: 8 / 3 } };
  const initial = new Float64Array([1, 1, 1]);
  const result = estimateConvergenceOrders(system, initial, 0.01, 0.2);

  it.each([
    { name: 'euler' as const, expectedOrder: 1 },
    { name: 'rk2' as const, expectedOrder: 2 },
    { name: 'rk4' as const, expectedOrder: 4 },
  ])('$name exposes the coarse/fine errors the order is derived from', ({ name, expectedOrder }) => {
    const { order, errorCoarse, errorFine } = result[name];
    expect(errorCoarse).toBeGreaterThan(0);
    expect(errorFine).toBeGreaterThan(0);
    expect(errorFine).toBeLessThan(errorCoarse);
    expect(order).toBeCloseTo(Math.log2(errorCoarse / errorFine), 10);
    expect(order).toBeCloseTo(expectedOrder, 0);
  });
});
