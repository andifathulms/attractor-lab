import { eulerStep, type DerivativeFn } from './euler';
import { rk2Step } from './rk2';
import { rk4Step } from './rk4';

export type Integrator = { readonly type: 'euler' } | { readonly type: 'rk2' } | { readonly type: 'rk4' };

export type IntegratorId = Integrator['type'];

/** One integration step. Pure: same inputs produce a byte-identical output state. */
export function step(
  integrator: Integrator,
  state: Float64Array,
  dt: number,
  f: DerivativeFn
): Float64Array {
  switch (integrator.type) {
    case 'euler':
      return eulerStep(state, dt, f);
    case 'rk2':
      return rk2Step(state, dt, f);
    case 'rk4':
      return rk4Step(state, dt, f);
    default: {
      const exhaustive: never = integrator;
      throw new Error(`unhandled integrator: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/** Global error order: halving dt should shrink error by roughly 2^order. */
export const convergenceOrder: Record<IntegratorId, number> = {
  euler: 1,
  rk2: 2,
  rk4: 4,
};

export { eulerStep, rk2Step, rk4Step };
export type { DerivativeFn };
