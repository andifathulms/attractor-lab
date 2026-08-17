export type BifurcationPoint = {
  readonly param: number;
  readonly value: number;
};

export type BifurcationPlotConfig = {
  readonly width: number;
  readonly height: number;
  readonly paramMin: number;
  readonly paramMax: number;
};

/**
 * Draws the accumulated (parameter, local maximum) samples — fixed point,
 * limit cycle, period doubling and chaos each show as a distinct visual
 * texture as the parameter sweeps across the x-axis. PRD.md §4.5.
 */
export function drawBifurcationPlot(
  ctx: CanvasRenderingContext2D,
  points: readonly BifurcationPoint[],
  config: BifurcationPlotConfig
): void {
  const { width, height, paramMin, paramMax } = config;

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0D0F14';
  ctx.fillRect(0, 0, width, height);

  if (points.length === 0) return;

  let minValue = Infinity;
  let maxValue = -Infinity;
  for (const p of points) {
    if (p.value < minValue) minValue = p.value;
    if (p.value > maxValue) maxValue = p.value;
  }

  const margin = 24;
  const paramSpan = Math.max(paramMax - paramMin, 1e-9);
  const valueSpan = Math.max(maxValue - minValue, 1e-9);

  const toX = (param: number): number =>
    margin + ((param - paramMin) / paramSpan) * (width - 2 * margin);
  const toY = (value: number): number =>
    height - margin - ((value - minValue) / valueSpan) * (height - 2 * margin);

  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(240, 192, 90, 0.5)';
  for (const p of points) {
    const x = toX(p.param);
    const y = toY(p.value);
    ctx.fillRect(x, y, 1, 1);
  }
}
