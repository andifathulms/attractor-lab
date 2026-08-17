import { describe, expect, it } from 'vitest';
import { kaplanYorkeDimension, largestLyapunovExponent, lyapunovSpectrum } from '../../lib/dynamics/lyapunov';
import { classicSystem } from '../../lib/dynamics/systems';
import { invariants } from '../../lib/dynamics/invariants';

describe('published constants — Lorenz, classic parameters', () => {
  const system = classicSystem.lorenz;
  const initial = new Float64Array([1, 1, 1]);
  const dt = 0.005;

  it('largest Lyapunov exponent reproduces the published ≈0.906', () => {
    const lle = largestLyapunovExponent(system, { type: 'rk4' }, initial, dt, 160000);
    const published = invariants.lorenz?.published.lyapunovMax ?? 0;
    expect(lle).toBeCloseTo(published, 0);
  });

  it('Kaplan–Yorke dimension from the full spectrum reproduces the published ≈2.06', () => {
    const spectrum = lyapunovSpectrum(system, { type: 'rk4' }, initial, dt, 40000);
    const dimension = kaplanYorkeDimension(spectrum);
    const published = invariants.lorenz?.published.kaplanYorkeDimension ?? 0;
    expect(dimension).toBeGreaterThan(published - 0.2);
    expect(dimension).toBeLessThan(published + 0.2);
  });
});
