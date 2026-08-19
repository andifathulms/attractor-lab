'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useT } from '@/lib/i18n/LocaleProvider';
import { drawSeparationPlot } from '@/lib/render/separation-plot';
import { appendSamples, EMPTY_SERIES, type Series } from '@/lib/render/series';

export type SeparationPlotHandle = {
  readonly pushSamples: (times: readonly number[], separations: readonly number[]) => void;
  readonly reset: () => void;
};

export type SeparationPlotProps = {
  readonly epsilon: number;
  readonly elapsed: number;
  readonly latestSeparation: number | undefined;
  readonly lyapunovMax: number | undefined;
  readonly horizon: number | undefined;
  readonly horizonThreshold: number;
};

const MAX_SAMPLES = 4000;

// Docks as a narrow band above the readout strip when the pair is active —
// log separation against time. DESIGN.md §6.
export const SeparationPlot = forwardRef<SeparationPlotHandle, SeparationPlotProps>(
  function SeparationPlot({ epsilon, elapsed, latestSeparation, lyapunovMax, horizon, horizonThreshold }, ref) {
    const t = useT();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const seriesRef = useRef<Series>(EMPTY_SERIES);

    const redraw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      drawSeparationPlot(ctx, seriesRef.current, {
        width: canvas.width,
        height: canvas.height,
        epsilon,
      });
    };

    useImperativeHandle(
      ref,
      () => ({
        pushSamples: (times, separations) => {
          seriesRef.current = appendSamples(seriesRef.current, times, separations, MAX_SAMPLES);
          redraw();
        },
        reset: () => {
          seriesRef.current = EMPTY_SERIES;
          redraw();
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [epsilon]
    );

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

    const ratio = latestSeparation !== undefined ? latestSeparation / epsilon : undefined;
    const hasDiverged = ratio !== undefined && ratio > 1;
    const impliedRate = hasDiverged && elapsed > 0 ? Math.log(ratio as number) / elapsed : undefined;

    return (
      <div className="w-full border-t border-rule bg-night px-4 py-2">
        <div className="flex h-20 w-full items-center gap-4">
          <div className="flex shrink-0 flex-col gap-1 font-mono text-sm text-readout">
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-trail-a" />
              A
            </span>
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-trail-b" />
              B
            </span>
          </div>
          <div className="h-full flex-1">
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>
          <span className="shrink-0 font-mono text-sm text-caption">log₁₀|Δ|</span>
        </div>
        {/* The worked example: real numbers from what's on screen right now,
            not a static explanation — the arithmetic that connects the
            visual (trails splitting) to λ, cited at the point it's used. */}
        <p className="mt-1 font-mono text-sm leading-snug text-caption [font-variant-numeric:tabular-nums]">
          {t.divergence.axisExplain}
          {latestSeparation !== undefined && ratio !== undefined && (
            hasDiverged && impliedRate !== undefined ? (
              <>
                {' '}
                ε={epsilon.toExponential(1)} → |Δ|={latestSeparation.toExponential(2)} (t={elapsed.toFixed(2)}, ×
                {ratio.toExponential(1)}) — {t.divergence.rateLabel} ≈{impliedRate.toFixed(3)}.{' '}
                {t.divergence.definitionNote}
                {lyapunovMax !== undefined && ` λ maks ≈ ${lyapunovMax.toFixed(4)}.`}
              </>
            ) : (
              <> {t.divergence.notYetDiverged}</>
            )
          )}
        </p>
        {lyapunovMax !== undefined && (
          <p className="mt-1 font-mono text-sm leading-snug text-caption [font-variant-numeric:tabular-nums]">
            {t.divergence.horizonNote} {t.divergence.horizonThresholdRule} ≈{horizonThreshold.toFixed(2)}.
            {horizon !== undefined &&
              ` λ maks=${lyapunovMax.toFixed(4)}, ε=${epsilon.toExponential(1)} → ${t.readout.horizon} ≈${horizon.toFixed(2)}.`}
          </p>
        )}
      </div>
    );
  }
);
