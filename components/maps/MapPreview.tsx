'use client';

import { useEffect, useRef } from 'react';
import { classicMap, iterate, type MapId } from '@/lib/dynamics/maps';
import { useT } from '@/lib/i18n/LocaleProvider';
import { TRAIL_COLORS } from '@/lib/render/trail-colors';

export type MapPreviewProps = {
  readonly mapId: MapId;
  readonly name: string;
};

const SKIP = 50; // discard the short transient before the map settles
const POINT_COUNT = 200000;

// No integration involved here — the map is its own step, and there's no
// step-size question to display. PRD.md §2.
export function MapPreview({ mapId, name }: MapPreviewProps) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const map = classicMap[mapId];
    const points: Float64Array[] = [];
    let state = new Float64Array([0.1, 0.1]);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < POINT_COUNT; i++) {
      const next = new Float64Array(2);
      iterate(map, state, next);
      state = next;
      if (i >= SKIP) {
        points.push(next);
        const x = next[0] as number;
        const y = next[1] as number;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    ctx.fillStyle = '#0D0F14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const margin = 16;
    const spanX = Math.max(maxX - minX, 1e-9);
    const spanY = Math.max(maxY - minY, 1e-9);
    const scale = Math.min(
      (canvas.width - 2 * margin) / spanX,
      (canvas.height - 2 * margin) / spanY
    );
    const offsetX = (canvas.width - spanX * scale) / 2 - minX * scale;
    const offsetY = (canvas.height - spanY * scale) / 2 - minY * scale;

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = TRAIL_COLORS.mapTrail;
    for (const point of points) {
      const x = (point[0] as number) * scale + offsetX;
      const y = canvas.height - ((point[1] as number) * scale + offsetY);
      ctx.fillRect(x, y, 1, 1);
    }
  }, [mapId]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={t.canvas.mapLabel.replace('{name}', name)}
      className="h-full w-full"
    />
  );
}
