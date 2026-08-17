import { cliffordClassic, cliffordStep, type CliffordParams } from './clifford';
import { deJongClassic, deJongStep, type DeJongParams } from './dejong';

export type Map2D =
  | { readonly type: 'clifford'; readonly params: CliffordParams }
  | { readonly type: 'dejong'; readonly params: DeJongParams };

export type MapId = Map2D['type'];

export const classicMap: Record<MapId, Map2D> = {
  clifford: { type: 'clifford', params: cliffordClassic },
  dejong: { type: 'dejong', params: deJongClassic },
};

/** Applies one iteration of the map. Writes into `out`, never allocates. */
export function iterate(map: Map2D, state: Float64Array, out: Float64Array): void {
  switch (map.type) {
    case 'clifford':
      cliffordStep(state, map.params, out);
      return;
    case 'dejong':
      deJongStep(state, map.params, out);
      return;
    default: {
      const exhaustive: never = map;
      throw new Error(`unhandled map: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export { cliffordStep, deJongStep, cliffordClassic, deJongClassic };
export type { CliffordParams, DeJongParams };
