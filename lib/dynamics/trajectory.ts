import { step, type Integrator } from './integrate';
import { derivative, type System } from './systems';

/** Integrates `steps` points forward from `initial`. Deterministic and pure. */
export function integrateTrajectory(
  system: System,
  integrator: Integrator,
  initial: Float64Array,
  dt: number,
  steps: number
): Float64Array[] {
  const f = (state: Float64Array, out: Float64Array): void => derivative(system, state, out);

  const trajectory: Float64Array[] = [new Float64Array(initial)];
  let current = initial;
  for (let i = 0; i < steps; i++) {
    current = step(integrator, current, dt, f);
    trajectory.push(current);
  }
  return trajectory;
}
