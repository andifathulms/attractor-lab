/**
 * Tolerances mirroring tests/constants/lorenz.test.ts exactly, so the
 * pass/fail badge on a system reference page reflects the same rule the
 * CI-gating suite asserts against — not a separately chosen threshold that
 * could quietly drift from it.
 */
export const LYAPUNOV_TOLERANCE = 0.5; // vitest toBeCloseTo(published, 0)
export const KAPLAN_YORKE_TOLERANCE = 0.2;

export function isWithinTolerance(computed: number, published: number, tolerance: number): boolean {
  return Math.abs(computed - published) < tolerance;
}
