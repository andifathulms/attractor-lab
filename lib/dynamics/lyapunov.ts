import { step, type Integrator } from './integrate';
import { derivative, type System } from './systems';

const STATE_DIM = 3;

function norm(v: Float64Array): number {
  let sumSq = 0;
  for (let i = 0; i < v.length; i++) sumSq += (v[i] as number) * (v[i] as number);
  return Math.sqrt(sumSq);
}

/**
 * Largest Lyapunov exponent via the Benettin two-trajectory method: a fiducial
 * and a shadow trajectory separated by `epsilon`, renormalized to `epsilon`
 * every `renormalizeEvery` steps, with the log growth accumulated and averaged
 * over elapsed system time.
 */
export function largestLyapunovExponent(
  system: System,
  integrator: Integrator,
  initial: Float64Array,
  dt: number,
  steps: number,
  options: { readonly epsilon?: number; readonly renormalizeEvery?: number } = {}
): number {
  const epsilon = options.epsilon ?? 1e-8;
  const renormalizeEvery = options.renormalizeEvery ?? 10;

  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);

  let fiducial = new Float64Array(initial);
  let shadow = new Float64Array(initial);
  shadow[0] = (shadow[0] as number) + epsilon;

  let logSum = 0;
  let elapsed = 0;

  for (let i = 0; i < steps; i++) {
    fiducial = step(integrator, fiducial, dt, f);
    shadow = step(integrator, shadow, dt, f);
    elapsed += dt;

    if ((i + 1) % renormalizeEvery === 0) {
      const diff = new Float64Array(STATE_DIM);
      for (let d = 0; d < STATE_DIM; d++) {
        diff[d] = (shadow[d] as number) - (fiducial[d] as number);
      }
      const separation = norm(diff);
      if (separation > 0) {
        logSum += Math.log(separation / epsilon);
        for (let d = 0; d < STATE_DIM; d++) {
          shadow[d] = (fiducial[d] as number) + (diff[d] as number) * (epsilon / separation);
        }
      }
    }
  }

  return logSum / elapsed;
}

/**
 * Full Lyapunov spectrum via Benettin's method with Gram-Schmidt renormalization
 * of `STATE_DIM` perturbation vectors, tracked alongside the fiducial trajectory.
 * Standard technique for estimating the spectrum without an analytic Jacobian.
 */
export function lyapunovSpectrum(
  system: System,
  integrator: Integrator,
  initial: Float64Array,
  dt: number,
  steps: number,
  options: { readonly epsilon?: number; readonly renormalizeEvery?: number } = {}
): number[] {
  const epsilon = options.epsilon ?? 1e-8;
  const renormalizeEvery = options.renormalizeEvery ?? 10;

  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);

  let fiducial = new Float64Array(initial);
  const shadows: Float64Array[] = [];
  for (let d = 0; d < STATE_DIM; d++) {
    const shadow = new Float64Array(initial);
    shadow[d] = (shadow[d] as number) + epsilon;
    shadows.push(shadow);
  }

  const logSums = new Array<number>(STATE_DIM).fill(0);
  let elapsed = 0;

  for (let i = 0; i < steps; i++) {
    fiducial = step(integrator, fiducial, dt, f);
    for (let d = 0; d < STATE_DIM; d++) {
      shadows[d] = step(integrator, shadows[d] as Float64Array, dt, f);
    }
    elapsed += dt;

    if ((i + 1) % renormalizeEvery === 0) {
      // Work in epsilon-normalized units so dot products are O(1) — doing
      // Gram-Schmidt directly on O(epsilon) vectors makes cross terms
      // negligible next to floating-point noise and orthogonalization silently
      // no-ops.
      const vectors: Float64Array[] = shadows.map((shadow) => {
        const diff = new Float64Array(STATE_DIM);
        for (let d = 0; d < STATE_DIM; d++) {
          diff[d] = ((shadow[d] as number) - (fiducial[d] as number)) / epsilon;
        }
        return diff;
      });

      // Gram-Schmidt orthonormalize, accumulating each vector's log-length
      // before normalization — that length is the local expansion rate.
      for (let a = 0; a < STATE_DIM; a++) {
        const va = vectors[a] as Float64Array;
        for (let b = 0; b < a; b++) {
          const vb = vectors[b] as Float64Array;
          let dot = 0;
          for (let d = 0; d < STATE_DIM; d++) dot += (va[d] as number) * (vb[d] as number);
          for (let d = 0; d < STATE_DIM; d++) va[d] = (va[d] as number) - dot * (vb[d] as number);
        }
        const length = norm(va);
        if (length > 0) {
          logSums[a] = (logSums[a] as number) + Math.log(length);
          for (let d = 0; d < STATE_DIM; d++) va[d] = (va[d] as number) / length;
        }
      }

      for (let d = 0; d < STATE_DIM; d++) {
        for (let a = 0; a < STATE_DIM; a++) {
          const va = vectors[a] as Float64Array;
          (shadows[a] as Float64Array)[d] = (fiducial[d] as number) + epsilon * (va[d] as number);
        }
      }
    }
  }

  return logSums.map((sum) => sum / elapsed);
}

/**
 * Kaplan–Yorke (Lyapunov) dimension from a spectrum sorted descending:
 * D_KY = j + (Σ₁ʲ λᵢ) / |λ_{j+1}|, where j is the largest index with a
 * non-negative partial sum.
 */
export function kaplanYorkeDimension(spectrumAscending: readonly number[]): number {
  const spectrum = [...spectrumAscending].sort((a, b) => b - a);
  let partialSum = 0;
  let j = 0;
  for (let i = 0; i < spectrum.length; i++) {
    const next = partialSum + (spectrum[i] as number);
    if (next < 0) break;
    partialSum = next;
    j = i + 1;
  }
  if (j >= spectrum.length) return j;
  const nextExponent = spectrum[j] as number;
  if (nextExponent === 0) return j;
  return j + partialSum / Math.abs(nextExponent);
}
