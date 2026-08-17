export type Point2D = {
  readonly x: number;
  readonly y: number;
};

function perpendicularDistance(point: Point2D, start: Point2D, end: Point2D): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    const ddx = point.x - start.x;
    const ddy = point.y - start.y;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }
  const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq;
  const projX = start.x + t * dx;
  const projY = start.y + t * dy;
  const ddx = point.x - projX;
  const ddy = point.y - projY;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}

/**
 * Ramer–Douglas–Peucker path simplification: drops points that lie within
 * `epsilon` of the line between their neighbours, keeping the path's shape
 * within tolerance while cutting the node count. Iterative (explicit stack)
 * so it doesn't blow the call stack on long trajectories.
 */
export function simplifyPath(points: readonly Point2D[], epsilon: number): Point2D[] {
  if (points.length < 3) return [...points];

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [startIdx, endIdx] = stack.pop() as [number, number];
    if (endIdx <= startIdx + 1) continue;

    const start = points[startIdx] as Point2D;
    const end = points[endIdx] as Point2D;

    let maxDist = -1;
    let maxIdx = -1;
    for (let i = startIdx + 1; i < endIdx; i++) {
      const dist = perpendicularDistance(points[i] as Point2D, start, end);
      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }

    if (maxDist > epsilon) {
      keep[maxIdx] = 1;
      stack.push([startIdx, maxIdx]);
      stack.push([maxIdx, endIdx]);
    }
  }

  const result: Point2D[] = [];
  for (let i = 0; i < points.length; i++) {
    if (keep[i] === 1) result.push(points[i] as Point2D);
  }
  return result;
}

/**
 * Binary-searches epsilon until the simplified path has at most `maxNodes`
 * points, so export always respects the plotter's node budget regardless
 * of how dense the source trajectory is.
 */
export function simplifyToBudget(points: readonly Point2D[], maxNodes: number): Point2D[] {
  if (points.length <= maxNodes) return simplifyPath(points, 0);

  let lo = 0;
  let hi = 1000;
  let best = simplifyPath(points, hi);
  for (let i = 0; i < 30 && best.length > maxNodes; i++) {
    hi *= 2;
    best = simplifyPath(points, hi);
  }

  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const candidate = simplifyPath(points, mid);
    if (candidate.length > maxNodes) {
      lo = mid;
    } else {
      hi = mid;
      best = candidate;
    }
  }
  return best;
}
