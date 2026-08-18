import { invariants, type SystemInvariants } from './dynamics/invariants';
import type { SystemId } from './dynamics/systems';

/**
 * Fraction of a system's bounding-box diagonal (lib/dynamics/invariants.ts —
 * the same analytic bound the boundedness test asserts against) used as the
 * separation at which two trajectories count as "unrelated" rather than
 * still tracking together. An explicit rule tied to the system's own
 * physical scale, not a fitted or arbitrary constant.
 */
const HORIZON_THRESHOLD_FRACTION = 0.1;

/** The separation threshold for `predictabilityHorizon`, in the system's own units. */
export function separationThreshold(systemId: SystemId): number {
  const { min, max } = (invariants[systemId] as SystemInvariants).boundingBox;
  const dx = (max[0] as number) - (min[0] as number);
  const dy = (max[1] as number) - (min[1] as number);
  const dz = (max[2] as number) - (min[2] as number);
  return Math.sqrt(dx * dx + dy * dy + dz * dz) * HORIZON_THRESHOLD_FRACTION;
}

/**
 * Predicted system time until two trajectories separated by `epsilon` grow
 * to `threshold` apart, from the exponential-divergence relationship
 * |Δ(t)| ≈ epsilon · e^(λt) that defines the largest Lyapunov exponent:
 * t = ln(threshold / epsilon) / λ.
 *
 * Undefined when λ ≤ 0 (nothing to predict — trajectories aren't separating
 * exponentially) or when epsilon already meets or exceeds the threshold.
 */
export function predictabilityHorizon(
  lyapunovMax: number,
  epsilon: number,
  threshold: number
): number | undefined {
  if (lyapunovMax <= 0) return undefined;
  if (epsilon <= 0 || epsilon >= threshold) return undefined;
  return Math.log(threshold / epsilon) / lyapunovMax;
}
