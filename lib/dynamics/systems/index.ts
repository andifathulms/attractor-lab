import { aizawaClassic, aizawaDerivative, type AizawaParams } from './aizawa';
import { halvorsenClassic, halvorsenDerivative, type HalvorsenParams } from './halvorsen';
import { lorenzClassic, lorenzDerivative, type LorenzParams } from './lorenz';
import { rosslerClassic, rosslerDerivative, type RosslerParams } from './rossler';
import { thomasClassic, thomasDerivative, type ThomasParams } from './thomas';

export type System =
  | { readonly type: 'lorenz'; readonly params: LorenzParams }
  | { readonly type: 'rossler'; readonly params: RosslerParams }
  | { readonly type: 'thomas'; readonly params: ThomasParams }
  | { readonly type: 'halvorsen'; readonly params: HalvorsenParams }
  | { readonly type: 'aizawa'; readonly params: AizawaParams };

export type SystemId = System['type'];

export const classicSystem: Record<SystemId, System> = {
  lorenz: { type: 'lorenz', params: lorenzClassic },
  rossler: { type: 'rossler', params: rosslerClassic },
  thomas: { type: 'thomas', params: thomasClassic },
  halvorsen: { type: 'halvorsen', params: halvorsenClassic },
  aizawa: { type: 'aizawa', params: aizawaClassic },
};

/** ẋ = F(state) for the given system. Writes into `out`, never allocates. */
export function derivative(system: System, state: Float64Array, out: Float64Array): void {
  switch (system.type) {
    case 'lorenz':
      lorenzDerivative(state, system.params, out);
      return;
    case 'rossler':
      rosslerDerivative(state, system.params, out);
      return;
    case 'thomas':
      thomasDerivative(state, system.params, out);
      return;
    case 'halvorsen':
      halvorsenDerivative(state, system.params, out);
      return;
    case 'aizawa':
      aizawaDerivative(state, system.params, out);
      return;
    default: {
      const exhaustive: never = system;
      throw new Error(`unhandled system: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export {
  lorenzDerivative,
  rosslerDerivative,
  thomasDerivative,
  halvorsenDerivative,
  aizawaDerivative,
  lorenzClassic,
  rosslerClassic,
  thomasClassic,
  halvorsenClassic,
  aizawaClassic,
};
export type { LorenzParams, RosslerParams, ThomasParams, HalvorsenParams, AizawaParams };
