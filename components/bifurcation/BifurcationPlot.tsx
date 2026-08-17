'use client';

import { useEffect, useRef } from 'react';
import type { LocalMaximaConfig } from '@/lib/dynamics/bifurcation';
import type { System } from '@/lib/dynamics/systems';
import { drawBifurcationPlot, type BifurcationPoint } from '@/lib/render/bifurcation-plot';
import type {
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
};

const INITIAL_STATE: readonly [number, number, number] = [1, 1, 1];

export function BifurcationPlot({
  system,
  paramName,
  paramMin,
  paramMax,
  sampleCount,
  config,
  onProgress,
}: BifurcationPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<BifurcationPoint[]>([]);

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

    const startMessage: StartMessage = {
      type: 'start',
      system,
      paramName,
      paramMin,
      paramMax,
      sampleCount,
      initial: INITIAL_STATE,
      config,
    };
    worker.postMessage(startMessage);

    return () => worker.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(system), paramName, paramMin, paramMax, sampleCount, JSON.stringify(config)]);

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

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
