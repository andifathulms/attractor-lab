import { describe, expect, it } from 'vitest';
import { xToParam } from '../../lib/render/bifurcation-plot';

describe('xToParam', () => {
  const config = { width: 424, paramMin: 0, paramMax: 30 };

  it('maps the left margin to paramMin and the right margin to paramMax', () => {
    expect(xToParam(24, config)).toBeCloseTo(0, 6);
    expect(xToParam(400, config)).toBeCloseTo(30, 6);
  });

  it('maps the midpoint to the midpoint parameter', () => {
    expect(xToParam((24 + 400) / 2, config)).toBeCloseTo(15, 6);
  });

  it('is linear across the full range', () => {
    const a = xToParam(100, config);
    const b = xToParam(200, config);
    const c = xToParam(300, config);
    expect(b - a).toBeCloseTo(c - b, 6);
  });
});
