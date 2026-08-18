import { describe, expect, it } from 'vitest';
import { boundingBoxDiagonal, predictabilityHorizon, separationThreshold } from '../../lib/predictability';

describe('predictabilityHorizon', () => {
  it('matches the closed form t = ln(threshold/epsilon) / lambda', () => {
    const horizon = predictabilityHorizon(1, 1e-8, 1);
    expect(horizon).toBeCloseTo(Math.log(1e8) / 1, 10);
  });

  it('is undefined for a non-positive Lyapunov exponent', () => {
    expect(predictabilityHorizon(0, 1e-8, 1)).toBeUndefined();
    expect(predictabilityHorizon(-0.5, 1e-8, 1)).toBeUndefined();
  });

  it('is undefined once epsilon has already reached the threshold', () => {
    expect(predictabilityHorizon(1, 1, 1)).toBeUndefined();
    expect(predictabilityHorizon(1, 2, 1)).toBeUndefined();
  });

  it('is undefined for a non-positive epsilon', () => {
    expect(predictabilityHorizon(1, 0, 1)).toBeUndefined();
    expect(predictabilityHorizon(1, -1e-8, 1)).toBeUndefined();
  });
});

describe('boundingBoxDiagonal', () => {
  it('matches the euclidean diagonal of the bounding box for lorenz', () => {
    // Lorenz bounding box: [-30,-30,-10] to [30,30,60] -> extents 60,60,70.
    const diagonal = Math.sqrt(60 * 60 + 60 * 60 + 70 * 70);
    expect(boundingBoxDiagonal('lorenz')).toBeCloseTo(diagonal, 10);
  });
});

describe('separationThreshold', () => {
  it('is 10% of the bounding-box diagonal', () => {
    expect(separationThreshold('lorenz')).toBeCloseTo(boundingBoxDiagonal('lorenz') * 0.1, 10);
  });

  it('is positive for every system with a bounding box', () => {
    for (const id of ['lorenz', 'rossler', 'thomas', 'halvorsen', 'aizawa'] as const) {
      expect(separationThreshold(id)).toBeGreaterThan(0);
    }
  });
});
