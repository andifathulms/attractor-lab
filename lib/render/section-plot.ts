export type SectionPoint = {
  readonly u: number;
  readonly v: number;
};

export type SectionPlotConfig = {
  readonly width: number;
  readonly height: number;
};

/**
 * Draws the accumulated Poincaré section as a flat scatter of its in-plane
 * coordinates — the "nearly one-dimensional map with visible structure"
 * PRD.md §4.4 describes, auto-scaled to fit the observed extent.
 */
export function drawSectionPlot(
  ctx: CanvasRenderingContext2D,
  points: readonly SectionPoint[],
  config: SectionPlotConfig
): void {
  const { width, height } = config;

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0D0F14';
  ctx.fillRect(0, 0, width, height);

  if (points.length === 0) return;

  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  for (const p of points) {
    if (p.u < minU) minU = p.u;
    if (p.u > maxU) maxU = p.u;
    if (p.v < minV) minV = p.v;
    if (p.v > maxV) maxV = p.v;
  }

  const margin = 8;
  const spanU = Math.max(maxU - minU, 1e-9);
  const spanV = Math.max(maxV - minV, 1e-9);

  const toX = (u: number): number => margin + ((u - minU) / spanU) * (width - 2 * margin);
  const toY = (v: number): number =>
    height - margin - ((v - minV) / spanV) * (height - 2 * margin);

  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(167, 139, 196, 0.5)';
  for (const p of points) {
    const x = toX(p.u);
    const y = toY(p.v);
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
