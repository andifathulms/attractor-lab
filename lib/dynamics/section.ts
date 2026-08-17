/**
 * A Poincaré plane: the set of points where coordinate `axis` equals `offset`.
 * Crossings are counted in the increasing direction only — the classic
 * unidirectional convention, without which the same trajectory strand would
 * register twice and the "nearly one-dimensional map" PRD.md §4.4 describes
 * would fold over itself.
 */
export type Plane = {
  readonly axis: 0 | 1 | 2;
  readonly offset: number;
};

/**
 * Detects an increasing-direction crossing of `plane` between two
 * consecutive trajectory states, returning the linearly interpolated 3D
 * point where the crossing occurs, or `null` if there was none.
 */
export function detectCrossing(
  prev: Float64Array,
  curr: Float64Array,
  plane: Plane
): Float64Array | null {
  const prevValue = (prev[plane.axis] as number) - plane.offset;
  const currValue = (curr[plane.axis] as number) - plane.offset;

  if (!(prevValue < 0 && currValue >= 0)) return null;

  const t = -prevValue / (currValue - prevValue);
  const point = new Float64Array(3);
  for (let d = 0; d < 3; d++) {
    point[d] = (prev[d] as number) + t * ((curr[d] as number) - (prev[d] as number));
  }
  return point;
}

/** The two coordinate indices spanning `plane` — the axes the section plot draws. */
export function inPlaneAxes(plane: Plane): readonly [0 | 1 | 2, 0 | 1 | 2] {
  const others = ([0, 1, 2] as const).filter((axis) => axis !== plane.axis);
  return [others[0] as 0 | 1 | 2, others[1] as 0 | 1 | 2];
}
