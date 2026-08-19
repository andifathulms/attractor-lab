'use client';

import { useEffect, useRef } from 'react';
import type { LocalMaximaConfig } from '@/lib/dynamics/bifurcation';
import type { System } from '@/lib/dynamics/systems';
import { BIFURCATION_INITIAL_STATE } from '@/lib/initial-state';
import { usePrefersReducedMotion } from '@/lib/motion';
import { drawBifurcationPlot, xToParam, type BifurcationPoint } from '@/lib/render/bifurcation-plot';
import type {
  CompleteMessage,
  SampleMessage,
  StartMessage,
  WorkerOutboundMessage,
} from '@/workers/bifurcation.worker';

export type BifurcationProgress = {
  readonly sampleIndex: number;
  readonly sampleCount: number;
  readonly done: boolean;
};

export type BifurcationPlotProps = {
  readonly system: System;
  readonly paramName: string;
  readonly paramMin: number;
  readonly paramMax: number;
  readonly sampleCount: number;
  readonly config: LocalMaximaConfig;
  readonly onProgress: (progress: BifurcationProgress) => void;
  /** Called with the exact parameter value under a click — lets a caller jump to that live trajectory. */
  readonly onParamPick?: (paramValue: number) => void;
};

export function BifurcationPlot({
  system,
  paramName,
  paramMin,
  paramMax,
  sampleCount,
  config,
  onProgress,
  onParamPick,
}: BifurcationPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<BifurcationPoint[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    drawBifurcationPlot(ctx, pointsRef.current, {
      width: canvas.width,
      height: canvas.height,
      paramMin,
      paramMax,
    });
  };

  // Re-sweeps from scratch and clears the buffer — the only case that clears it.
  useEffect(() => {
    pointsRef.current = [];
    redraw();

    const worker = new Worker(new URL('../../workers/bifurcation.worker.ts', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const message = event.data;
      if (message.type === 'sample') {
        handleSample(message);
      } else if (message.type === 'complete') {
        handleComplete(message);
      } else {
        onProgress({ sampleIndex: sampleCount, sampleCount, done: true });
      }
    };

    const handleSample = (message: SampleMessage) => {
      for (let i = 0; i < message.maxima.length; i++) {
        pointsRef.current.push({ param: message.param, value: message.maxima[i] as number });
      }
      redraw();
      onProgress({ sampleIndex: message.sampleIndex + 1, sampleCount: message.sampleCount, done: false });
    };

    // Reduced motion: the whole sweep arrived as one complete batch — draw
    // it in a single redraw instead of building the diagram up sample by
    // sample. DESIGN.md §7.
    const handleComplete = (message: CompleteMessage) => {
      const points: BifurcationPoint[] = [];
      for (let i = 0; i < message.params.length; i++) {
        points.push({ param: message.params[i] as number, value: message.values[i] as number });
      }
      pointsRef.current = points;
      redraw();
      onProgress({ sampleIndex: sampleCount, sampleCount, done: true });
    };

    const startMessage: StartMessage = {
      type: 'start',
      system,
      paramName,
      paramMin,
      paramMax,
      sampleCount,
      initial: BIFURCATION_INITIAL_STATE,
      config,
      reducedMotion,
    };
    worker.postMessage(startMessage);

    return () => worker.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(system), paramName, paramMin, paramMax, sampleCount, JSON.stringify(config), reducedMotion]);

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

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onParamPick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    onParamPick(xToParam(x, { width: canvas.width, paramMin, paramMax }));
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      aria-hidden="true"
      className={onParamPick ? 'h-full w-full cursor-crosshair' : 'h-full w-full'}
    />
  );
}
