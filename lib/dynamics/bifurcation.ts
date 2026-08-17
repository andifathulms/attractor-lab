import { rk4Step } from './integrate/rk4';
import { derivative, type System } from './systems';

export type LocalMaximaConfig = {
  readonly dt: number;
  readonly burnInSteps: number;
  readonly sampleSteps: number;
  readonly axis: 0 | 1 | 2;
};

/**
 * Integrates one parameter value's trajectory, discards `burnInSteps` of
 * transient, then records local maxima of `axis` over `sampleSteps` more —
 * the standard construction for a bifurcation diagram from a continuous
 * flow (Lorenz's own "next maximum of z" map generalizes to this).
 * PRD.md §4.5.
 */
export function localMaxima(
  system: System,
  initial: Float64Array,
  config: LocalMaximaConfig
): number[] {
  const { dt, burnInSteps, sampleSteps, axis } = config;
  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);

  let state = new Float64Array(initial);
  for (let i = 0; i < burnInSteps; i++) state = rk4Step(state, dt, f);

  const maxima: number[] = [];
  let prevPrev = state[axis] as number;
  state = rk4Step(state, dt, f);
  let prev = state[axis] as number;

  for (let i = 0; i < sampleSteps; i++) {
    state = rk4Step(state, dt, f);
    const curr = state[axis] as number;
    if (prev > prevPrev && prev > curr) {
      maxima.push(prev);
    }
    prevPrev = prev;
    prev = curr;
  }

  return maxima;
}
