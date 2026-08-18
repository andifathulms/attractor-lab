'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { drawSeparationPlot } from '@/lib/render/separation-plot';
import { appendSamples, EMPTY_SERIES, type Series } from '@/lib/render/series';

export type SeparationPlotHandle = {
  readonly pushSamples: (times: readonly number[], separations: readonly number[]) => void;
  readonly reset: () => void;
};

export type SeparationPlotProps = {
  readonly epsilon: number;
};

const MAX_SAMPLES = 4000;
const TRAIL_A = '#F0C05A';
const TRAIL_B = '#5FB0D9';

// Docks as a narrow band above the readout strip when the pair is active —
// log separation against time. DESIGN.md §6.
export const SeparationPlot = forwardRef<SeparationPlotHandle, SeparationPlotProps>(
  function SeparationPlot({ epsilon }, ref) {
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

    return (
      <div className="flex h-20 w-full items-center gap-4 border-t border-rule bg-night px-4">
        <div className="flex shrink-0 flex-col gap-1 font-mono text-sm text-readout">
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: TRAIL_A }} />
            A
          </span>
          <span>
            <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: TRAIL_B }} />
            B
          </span>
        </div>
        <div className="h-full flex-1">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
        <span className="shrink-0 font-mono text-sm text-rule">log₁₀|Δ|</span>
      </div>
    );
  }
);
