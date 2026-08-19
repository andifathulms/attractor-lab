'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { ConvergenceCheckSeries } from '@/lib/convergence-series';
import { useT } from '@/lib/i18n/LocaleProvider';
import { drawSeparationPlot, type SeparationCurve } from '@/lib/render/separation-plot';
import { appendSamples, EMPTY_SERIES, type Series } from '@/lib/render/series';

export type ComparisonSeparationPlotHandle = {
  readonly pushSamples: (
    times: readonly number[],
    eulerVsRk4: readonly number[],
    rk2VsRk4: readonly number[]
  ) => void;
  readonly reset: () => void;
};

export type ComparisonSeparationPlotProps = {
  /** When set, replaces the live streaming curves with a static before/after
   *  comparison at dt and dt/2 — see DESIGN-REWORK.md §1.2. Cleared (back to
   *  the live view) by passing undefined. */
  readonly convergenceCheck: ConvergenceCheckSeries | undefined;
};

const MAX_SAMPLES = 4000;
const EULER_DASH: readonly number[] = [];
const RK2_DASH: readonly number[] = [6, 4];
const EULER_HALF_DASH: readonly number[] = [1, 3];
const RK2_HALF_DASH: readonly number[] = [1, 3, 6, 3];

function toSeries(times: readonly number[], values: readonly number[]): Series {
  return { times, values };
}

// Docks as a narrow band above the readout strip, same as the divergence
// pair's plot on /jelajah — Euler/RK2's truncation-error separation from RK4
// is the same phenomenon on the same log axis (DESIGN-REWORK.md §1.1). The
// curves are told apart by dash pattern and the legend, never by hue — a
// separation curve is not a trajectory, so it never takes trail-a or
// trail-b. CLAUDE.md invariant 8.
export const ComparisonSeparationPlot = forwardRef<ComparisonSeparationPlotHandle, ComparisonSeparationPlotProps>(
  function ComparisonSeparationPlot({ convergenceCheck }, ref) {
    const t = useT();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const eulerSeriesRef = useRef<Series>(EMPTY_SERIES);
    const rk2SeriesRef = useRef<Series>(EMPTY_SERIES);

    const redraw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const curves: SeparationCurve[] = convergenceCheck
        ? [
            { series: toSeries(convergenceCheck.before.times, convergenceCheck.before.eulerVsRk4), dash: EULER_DASH },
            { series: toSeries(convergenceCheck.before.times, convergenceCheck.before.rk2VsRk4), dash: RK2_DASH },
            {
              series: toSeries(convergenceCheck.after.times, convergenceCheck.after.eulerVsRk4),
              dash: EULER_HALF_DASH,
            },
            { series: toSeries(convergenceCheck.after.times, convergenceCheck.after.rk2VsRk4), dash: RK2_HALF_DASH },
          ]
        : [
            { series: eulerSeriesRef.current, dash: EULER_DASH },
            { series: rk2SeriesRef.current, dash: RK2_DASH },
          ];

      // No ε here to anchor the floor, so it's read off the data itself:
      // the smallest separation seen so far, which is close to where each
      // curve actually starts (its truncation error at the first sampled
      // step) rather than an arbitrary constant.
      const allValues = curves.flatMap((curve) => curve.series.values);
      const smallestPositive = allValues.reduce(
        (min, v) => (v > 0 && v < min ? v : min),
        Infinity
      );
      const floorLog10 = Number.isFinite(smallestPositive) ? Math.log10(smallestPositive) - 1 : -10;

      drawSeparationPlot(ctx, curves, { width: canvas.width, height: canvas.height, floorLog10 });
    };

    useImperativeHandle(
      ref,
      () => ({
        pushSamples: (times, eulerVsRk4, rk2VsRk4) => {
          eulerSeriesRef.current = appendSamples(eulerSeriesRef.current, times, eulerVsRk4, MAX_SAMPLES);
          rk2SeriesRef.current = appendSamples(rk2SeriesRef.current, times, rk2VsRk4, MAX_SAMPLES);
          // A check in progress owns the plot until it's cleared — a live
          // batch arriving mid-check shouldn't paint over the comparison.
          if (!convergenceCheck) redraw();
        },
        reset: () => {
          eulerSeriesRef.current = EMPTY_SERIES;
          rk2SeriesRef.current = EMPTY_SERIES;
          if (!convergenceCheck) redraw();
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [convergenceCheck]
    );

    // The check is prop-driven (set/cleared by ComparisonPanel's button and
    // by any change that invalidates it), so it needs its own redraw trigger
    // independent of the imperative live-sample path above.
    useEffect(() => {
      redraw();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [convergenceCheck]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redraw();
      };
      resize();

      const observer = new ResizeObserver(resize);
      observer.observe(canvas.parentElement as Element);
      return () => observer.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="w-full border-t border-rule bg-night px-4 py-2">
        <div className="flex h-20 w-full items-center gap-4">
          <div className="flex shrink-0 flex-col gap-2 font-mono text-sm text-readout">
            <span className="flex items-center gap-2">
              <DashSwatch dash={EULER_DASH} />
              {t.readout.separationA}
              {convergenceCheck && ' (dt)'}
            </span>
            <span className="flex items-center gap-2">
              <DashSwatch dash={RK2_DASH} />
              {t.readout.separationB}
              {convergenceCheck && ' (dt)'}
            </span>
            {convergenceCheck && (
              <>
                <span className="flex items-center gap-2">
                  <DashSwatch dash={EULER_HALF_DASH} />
                  {t.readout.separationA} (dt/2)
                </span>
                <span className="flex items-center gap-2">
                  <DashSwatch dash={RK2_HALF_DASH} />
                  {t.readout.separationB} (dt/2)
                </span>
              </>
            )}
          </div>
          <div className="h-full flex-1">
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>
          <span className="shrink-0 font-mono text-sm text-caption">log₁₀|Δ|</span>
        </div>
      </div>
    );
  }
);

function DashSwatch({ dash }: { readonly dash: readonly number[] }) {
  return (
    <svg width="14" height="2" className="shrink-0 text-readout" aria-hidden="true">
      <line
        x1="0"
        y1="1"
        x2="14"
        y2="1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={dash.length > 0 ? dash.join(' ') : undefined}
      />
    </svg>
  );
}
