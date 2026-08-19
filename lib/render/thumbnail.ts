import type { Integrator } from '../dynamics/integrate';
import type { System } from '../dynamics/systems';
import { integrateTrajectory } from '../dynamics/trajectory';
import { simplifyToBudget, type Point2D } from '../export/simplify';
import { project, type Rotation } from './projection';

export type FlowThumbnail = {
  readonly d: string;
  readonly viewBox: string;
};

const ROTATION: Rotation = { yaw: 0.6, pitch: -0.3 };
const VIEW_SIZE = 200;
const MARGIN = 10;
const MAX_NODES = 500;

// Deliberately asymmetric: Thomas and Halvorsen are cyclically symmetric
// systems (x, y, z play interchangeable roles in their equations), so a
// symmetric start like [0.1, 0.1, 0.1] never leaves the invariant x=y=z
// diagonal and collapses to the fixed point on it instead of showing the
// attractor. A perturbed start escapes that diagonal for every system.
export const THUMBNAIL_INITIAL_STATE: readonly [number, number, number] = [0.1, 0.15, 0.12];
export const THUMBNAIL_DT = 0.005;
export const THUMBNAIL_STEPS = 12000;
export const THUMBNAIL_INTEGRATOR: Integrator = { type: 'rk4' };

/**
 * A small static SVG path for a system's classic trajectory — precomputed
 * once (this page is statically exported, so this runs at build time, not
 * in a visitor's browser), never a capture of the live canvas. Same RK4
 * integrator and orthographic projection the live canvas uses; simplified
 * to a plotter-scale node budget so the index page stays light with seven
 * of these on one page. DESIGN-REWORK.md §3.
 */
export function buildFlowThumbnail(system: System): FlowThumbnail {
  const trajectory = integrateTrajectory(
    system,
    THUMBNAIL_INTEGRATOR,
    new Float64Array(THUMBNAIL_INITIAL_STATE),
    THUMBNAIL_DT,
    THUMBNAIL_STEPS
  );
  const raw: Point2D[] = trajectory.map((point) =>
    project(point, { rotation: ROTATION, zoom: 1, width: 0, height: 0 })
  );

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of raw) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  const spanX = Math.max(maxX - minX, 1e-9);
  const spanY = Math.max(maxY - minY, 1e-9);
  const scale = Math.min((VIEW_SIZE - 2 * MARGIN) / spanX, (VIEW_SIZE - 2 * MARGIN) / spanY);
  const offsetX = (VIEW_SIZE - spanX * scale) / 2 - minX * scale;
  const offsetY = (VIEW_SIZE - spanY * scale) / 2 - minY * scale;

  const fitted: Point2D[] = raw.map((point) => ({
    x: point.x * scale + offsetX,
    y: point.y * scale + offsetY,
  }));

  const simplified = simplifyToBudget(fitted, MAX_NODES);
  const d = simplified
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  return { d, viewBox: `0 0 ${VIEW_SIZE} ${VIEW_SIZE}` };
}
