import type { Series } from './series';

export type SeparationPlotConfig = {
  readonly width: number;
  readonly height: number;
  readonly epsilon: number;
};

/**
 * Draws log₁₀|Δ| against elapsed system time — the divergence plot that
 * docks above the readout strip. `epsilon` anchors the bottom of the y-axis
 * so the plot always shows the full climb from the starting separation.
 */
export function drawSeparationPlot(
  ctx: CanvasRenderingContext2D,
  series: Series,
  config: SeparationPlotConfig
): void {
  const { width, height, epsilon } = config;

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0D0F14';
  ctx.fillRect(0, 0, width, height);

  if (series.times.length < 2) return;

  const times = series.times;
  const logValues = series.values.map((v) => Math.log10(Math.max(v, 1e-300)));

  const minTime = times[0] as number;
  const maxTime = times[times.length - 1] as number;
  const minLog = Math.log10(epsilon) - 1;
  const maxLog = Math.max(0, ...logValues);

  const timeSpan = Math.max(maxTime - minTime, 1e-9);
  const logSpan = Math.max(maxLog - minLog, 1e-9);
  const margin = 4;

  const toX = (t: number): number => margin + ((t - minTime) / timeSpan) * (width - 2 * margin);
  const toY = (logV: number): number =>
    height - margin - ((logV - minLog) / logSpan) * (height - 2 * margin);

  ctx.strokeStyle = '#B8C2CE';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  times.forEach((t, i) => {
    const x = toX(t);
    const y = toY(logValues[i] as number);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}
