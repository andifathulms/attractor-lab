import type { Series } from './series';

// A separation curve is never a trajectory, so it never takes trail-a or
// trail-b (CLAUDE.md invariant 8, DESIGN.md §4's rainbow-by-velocity ban
// extends to this: hue is trajectory identity only). Every curve strokes in
// the same readout grey; multiple curves are told apart by dash pattern and
// a legend, not by colour.
export type SeparationCurve = {
  readonly series: Series;
  readonly dash: readonly number[];
};

export type SeparationPlotConfig = {
  readonly width: number;
  readonly height: number;
  /** Bottom of the y-axis in log10 units — the starting separation the climb is measured from. */
  readonly floorLog10: number;
};

/**
 * Draws one or more log₁₀|Δ| curves against elapsed system time, sharing one
 * axis so a shared slope — the same Lyapunov exponent driving every curve on
 * the plot — is visible in one frame. `floorLog10` anchors the bottom of the
 * y-axis so the plot always shows the full climb from the starting
 * separation, whatever produced it (a chosen ε or a computed truncation
 * error).
 */
export function drawSeparationPlot(
  ctx: CanvasRenderingContext2D,
  curves: readonly SeparationCurve[],
  config: SeparationPlotConfig
): void {
  const { width, height, floorLog10 } = config;

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0D0F14';
  ctx.fillRect(0, 0, width, height);

  const withData = curves.filter((curve) => curve.series.times.length >= 2);
  if (withData.length === 0) return;

  const allTimes = withData.flatMap((curve) => curve.series.times);
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);
  const timeSpan = Math.max(maxTime - minTime, 1e-9);

  const minLog = floorLog10;
  const maxLog = Math.max(
    0,
    ...withData.flatMap((curve) => curve.series.values.map((v) => Math.log10(Math.max(v, 1e-300))))
  );
  const logSpan = Math.max(maxLog - minLog, 1e-9);
  const margin = 4;

  const toX = (t: number): number => margin + ((t - minTime) / timeSpan) * (width - 2 * margin);
  const toY = (logV: number): number =>
    height - margin - ((logV - minLog) / logSpan) * (height - 2 * margin);

  ctx.strokeStyle = '#B8C2CE';
  ctx.lineWidth = 1.5;
  for (const curve of withData) {
    ctx.setLineDash(curve.dash as number[]);
    ctx.beginPath();
    curve.series.times.forEach((t, i) => {
      const logV = Math.log10(Math.max(curve.series.values[i] as number, 1e-300));
      const x = toX(t);
      const y = toY(logV);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  ctx.setLineDash([]);
}
