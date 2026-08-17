import { project, type Rotation } from '../render/projection';
import { simplifyToBudget, type Point2D } from './simplify';

export type PlotterExportMeta = {
  readonly systemName: string;
  readonly params: Readonly<Record<string, number>>;
  readonly integrator: string;
  readonly dt: number;
};

/** What a canvas component exposes for export — its accumulated trajectories and current viewing angle. */
export type ExportSnapshot = {
  readonly trajectories: readonly (readonly Float64Array[])[];
  readonly rotation: Rotation;
};

export type PlotterExportConfig = {
  readonly paperWidthMm: number;
  readonly paperHeightMm: number;
  readonly marginMm: number;
  readonly strokeWidthMm: number;
  readonly maxNodes: number;
  readonly rotation: Rotation;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pathData(points: readonly Point2D[]): string {
  if (points.length === 0) return '';
  const first = points[0] as Point2D;
  const rest = points
    .slice(1)
    .map((p) => `L ${p.x.toFixed(3)} ${p.y.toFixed(3)}`)
    .join(' ');
  return `M ${first.x.toFixed(3)} ${first.y.toFixed(3)} ${rest}`.trim();
}

type Bounds = { readonly minX: number; readonly maxX: number; readonly minY: number; readonly maxY: number };

function boundsOf(points: readonly Point2D[]): Bounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Fits a set of raw (unscaled) 2D points into the printable area using a
 * shared `bounds` — passing every trajectory's combined bounds, rather than
 * each one's own, keeps multiple trajectories (the divergence pair, the
 * integrator comparison) in the same coordinate frame instead of each being
 * independently stretched to fill the page and losing their relative
 * positions. The printable area is the paper minus its margin on every side.
 */
function fitToPage(points: readonly Point2D[], bounds: Bounds, config: PlotterExportConfig): Point2D[] {
  if (points.length === 0) return [];

  const printableWidth = config.paperWidthMm - 2 * config.marginMm;
  const printableHeight = config.paperHeightMm - 2 * config.marginMm;
  const spanX = Math.max(bounds.maxX - bounds.minX, 1e-9);
  const spanY = Math.max(bounds.maxY - bounds.minY, 1e-9);
  const scale = Math.min(printableWidth / spanX, printableHeight / spanY);

  const offsetX = config.marginMm + (printableWidth - spanX * scale) / 2;
  const offsetY = config.marginMm + (printableHeight - spanY * scale) / 2;

  return points.map((p) => ({
    x: offsetX + (p.x - bounds.minX) * scale,
    y: offsetY + (p.y - bounds.minY) * scale,
  }));
}

function formatParams(params: Readonly<Record<string, number>>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
}

/**
 * Trajectory (or trajectories, for the divergence pair / integrator
 * comparison) → plotter-ready SVG: no fills, no opacity, one stroke weight,
 * path-simplified, sized in millimetres. PRD.md §4.7, DESIGN.md §9.
 *
 * Each trajectory is a list of Float64Arrays whose length is a multiple of
 * 3 — either one array per point, or larger concatenated xyz-triple
 * batches (the shape the canvas components accumulate points in) — so
 * callers can pass either representation without conversion.
 */
export function exportPlotterSvg(
  trajectories: readonly (readonly Float64Array[])[],
  meta: PlotterExportMeta,
  config: PlotterExportConfig
): string {
  const projectionConfig = { rotation: config.rotation, zoom: 1, width: 0, height: 0 };
  const projected = trajectories.map((trajectory) => {
    const points: Point2D[] = [];
    for (const chunk of trajectory) {
      for (let i = 0; i + 2 < chunk.length; i += 3) {
        points.push(project(chunk.subarray(i, i + 3), projectionConfig));
      }
    }
    return points;
  });
  const sharedBounds = boundsOf(projected.flat());

  const perPathBudget = Math.max(2, Math.floor(config.maxNodes / Math.max(1, projected.length)));
  const paths = projected
    .map((trajectory) => {
      const fitted = fitToPage(trajectory, sharedBounds, config);
      const simplified = simplifyToBudget(fitted, perPathBudget);
      return pathData(simplified);
    })
    .filter((d) => d.length > 0);

  const strokeWidth = config.strokeWidthMm;
  const pathElements = paths
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="#000000" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join('\n  ');

  const caption = escapeXml(
    `${meta.systemName} — ${formatParams(meta.params)} — ${meta.integrator}, dt=${meta.dt}`
  );
  const captionY = config.paperHeightMm - config.marginMm / 2;
  const captionElement = `<text x="${config.marginMm}" y="${captionY.toFixed(2)}" font-family="monospace" font-size="2.5" fill="none" stroke="#000000" stroke-width="${strokeWidth}">${caption}</text>`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${config.paperWidthMm}mm" height="${config.paperHeightMm}mm" viewBox="0 0 ${config.paperWidthMm} ${config.paperHeightMm}" fill="none">`,
    `  ${pathElements}`,
    `  ${captionElement}`,
    '</svg>',
  ].join('\n');
}
