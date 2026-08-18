import { describe, expect, it } from 'vitest';
import { isWithinTolerance, KAPLAN_YORKE_TOLERANCE, LYAPUNOV_TOLERANCE } from '../../lib/constants-check';

describe('isWithinTolerance', () => {
  it('accepts a computed value inside the tolerance band', () => {
    expect(isWithinTolerance(0.9, 0.906, LYAPUNOV_TOLERANCE)).toBe(true);
    expect(isWithinTolerance(2.1, 2.06, KAPLAN_YORKE_TOLERANCE)).toBe(true);
  });

  it('rejects a computed value outside the tolerance band', () => {
    expect(isWithinTolerance(0.3, 0.906, LYAPUNOV_TOLERANCE)).toBe(false);
    expect(isWithinTolerance(3.0, 2.06, KAPLAN_YORKE_TOLERANCE)).toBe(false);
  });

  it('treats the boundary as failing (strict inequality)', () => {
    expect(isWithinTolerance(1.4061, 0.906, LYAPUNOV_TOLERANCE)).toBe(false);
  });
});
