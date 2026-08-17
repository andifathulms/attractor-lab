import { project, type ProjectionConfig, type ScreenPoint } from './projection';

/** Fills the buffer with the ground colour — the only operation that discards density. */
export function clearBuffer(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#0D0F14';
  ctx.fillRect(0, 0, width, height);
}

/** Draws one line segment additively — repeated overlapping strokes are what build density. */
export function drawSegment(
  ctx: CanvasRenderingContext2D,
  from: ScreenPoint,
  to: ScreenPoint,
  color: string
): void {
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

export type TrajectoryLayer = {
  readonly chunks: readonly Float64Array[];
  readonly color: string;
};

/** Draws one trajectory's chunks additively at the current projection, without clearing first. */
function drawLayer(ctx: CanvasRenderingContext2D, layer: TrajectoryLayer, config: ProjectionConfig): void {
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = layer.color;
  ctx.lineWidth = 1;

  let prev: ScreenPoint | null = null;
  for (const chunk of layer.chunks) {
    for (let i = 0; i + 2 < chunk.length; i += 3) {
      const point = chunk.subarray(i, i + 3);
      const screen = project(point, config);
      if (prev) {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(screen.x, screen.y);
        ctx.stroke();
      }
      prev = screen;
    }
  }
}

/**
 * Full redraw of one or more trajectory layers at the current projection —
 * used after orbit/zoom, and for the divergence pair's two colours sharing
 * one buffer.
 */
export function redrawLayers(
  ctx: CanvasRenderingContext2D,
  layers: readonly TrajectoryLayer[],
  config: ProjectionConfig
): void {
  clearBuffer(ctx, config.width, config.height);
  for (const layer of layers) {
    drawLayer(ctx, layer, config);
  }
}

/** Full redraw from stored trajectory chunks at the current projection — used after orbit/zoom. */
export function redrawTrajectory(
  ctx: CanvasRenderingContext2D,
  chunks: readonly Float64Array[],
  config: ProjectionConfig,
  color: string
): void {
  redrawLayers(ctx, [{ chunks, color }], config);
}
