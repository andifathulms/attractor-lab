'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { inPlaneAxes, type Plane } from '@/lib/dynamics/section';
import { drawSectionPlot, type SectionPoint } from '@/lib/render/section-plot';

export type SectionPlotHandle = {
  readonly pushCrossings: (crossings: Float64Array) => void;
  readonly reset: () => void;
};

export type SectionPlotProps = {
  readonly plane: Plane;
};

const MAX_POINTS = 20000;

// Docks as a narrow band above the readout strip — the flattened Poincaré
// map itself, "a three-dimensional tangle becomes a nearly one-dimensional
// map with visible structure." PRD.md §4.4.
export const SectionPlot = forwardRef<SectionPlotHandle, SectionPlotProps>(function SectionPlot(
  { plane },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<SectionPoint[]>([]);

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    drawSectionPlot(ctx, pointsRef.current, { width: canvas.width, height: canvas.height });
  };

  useImperativeHandle(
    ref,
    () => ({
      pushCrossings: (crossings) => {
        const [uAxis, vAxis] = inPlaneAxes(plane);
        for (let i = 0; i + 2 < crossings.length; i += 3) {
          pointsRef.current.push({ u: crossings[i + uAxis] as number, v: crossings[i + vAxis] as number });
        }
        if (pointsRef.current.length > MAX_POINTS) {
          pointsRef.current = pointsRef.current.slice(pointsRef.current.length - MAX_POINTS);
        }
        redraw();
      },
      reset: () => {
        pointsRef.current = [];
        redraw();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plane.axis, plane.offset]
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
    <div className="flex h-28 w-full items-center gap-4 border-t border-rule bg-night px-4">
      <span className="shrink-0 font-mono text-sm text-caption">irisan Poincaré</span>
      <div className="h-full flex-1 py-2">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
});
