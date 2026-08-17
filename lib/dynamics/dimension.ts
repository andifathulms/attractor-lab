/**
 * Box-counting (capacity) dimension of a trajectory, for the live readout.
 * Covers the trajectory's bounding box with cubes of side `eps`, counts
 * occupied cubes N(eps) at each of a range of scales, and fits the slope
 * of log N(eps) against log(1/eps) — the definition of the dimension.
 */
export function boxCountingDimension(
  points: readonly Float64Array[],
  scaleCount = 8
): number {
  if (points.length < 2) return 0;

  const dims = points[0]?.length ?? 0;
  const min = new Float64Array(dims).fill(Infinity);
  const max = new Float64Array(dims).fill(-Infinity);
  for (const point of points) {
    for (let d = 0; d < dims; d++) {
      const v = point[d] as number;
      if (v < (min[d] as number)) min[d] = v;
      if (v > (max[d] as number)) max[d] = v;
    }
  }

  let extent = 0;
  for (let d = 0; d < dims; d++) {
    extent = Math.max(extent, (max[d] as number) - (min[d] as number));
  }
  if (extent === 0) return 0;

  const logInvEps: number[] = [];
  const logN: number[] = [];

  for (let s = 1; s <= scaleCount; s++) {
    const eps = extent / 2 ** s;
    const occupied = new Set<string>();
    for (const point of points) {
      const cell: number[] = [];
      for (let d = 0; d < dims; d++) {
        cell.push(Math.floor(((point[d] as number) - (min[d] as number)) / eps));
      }
      occupied.add(cell.join(','));
    }
    if (occupied.size > 0) {
      logInvEps.push(Math.log(1 / eps));
      logN.push(Math.log(occupied.size));
    }
  }

  return linearRegressionSlope(logInvEps, logN);
}

function linearRegressionSlope(xs: readonly number[], ys: readonly number[]): number {
  const n = xs.length;
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i] as number;
    sumY += ys[i] as number;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    const dx = (xs[i] as number) - meanX;
    const dy = (ys[i] as number) - meanY;
    numerator += dx * dy;
    denominator += dx * dx;
  }
  if (denominator === 0) return 0;
  return numerator / denominator;
}
