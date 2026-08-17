import { describe, expect, it } from 'vitest';
import { detectCrossing, inPlaneAxes, type Plane } from '../../lib/dynamics/section';

describe('detectCrossing', () => {
  const plane: Plane = { axis: 2, offset: 5 };

  it('interpolates the crossing point on an increasing pass through the plane', () => {
    const prev = new Float64Array([0, 0, 4]);
    const curr = new Float64Array([10, 20, 6]);
    const crossing = detectCrossing(prev, curr, plane);
    expect(crossing).not.toBeNull();
    expect(crossing?.[0]).toBeCloseTo(5, 10);
    expect(crossing?.[1]).toBeCloseTo(10, 10);
    expect(crossing?.[2]).toBeCloseTo(5, 10);
  });

  it('does not register a decreasing pass', () => {
    const prev = new Float64Array([0, 0, 6]);
    const curr = new Float64Array([10, 20, 4]);
    expect(detectCrossing(prev, curr, plane)).toBeNull();
  });

  it('does not register when neither side reaches the plane', () => {
    const prev = new Float64Array([0, 0, 1]);
    const curr = new Float64Array([10, 20, 2]);
    expect(detectCrossing(prev, curr, plane)).toBeNull();
  });
});

describe('inPlaneAxes', () => {
  it('returns the two axes not sliced by the plane', () => {
    expect(inPlaneAxes({ axis: 2, offset: 0 })).toEqual([0, 1]);
    expect(inPlaneAxes({ axis: 0, offset: 0 })).toEqual([1, 2]);
    expect(inPlaneAxes({ axis: 1, offset: 0 })).toEqual([0, 2]);
  });
});
