import type { Rotation } from './render/projection';

/** Radians per keypress — a deliberate, discrete step, not a per-pixel drag rate. */
export const KEYBOARD_ROTATE_STEP = 0.05;
/** Zoom multiplier per keypress. */
export const KEYBOARD_ZOOM_FACTOR = 1.1;

export type CanvasKeyboardBounds = {
  readonly pitchLimit: number;
  readonly zoomMin: number;
  readonly zoomMax: number;
};

export type CanvasKeyboardResult = {
  readonly rotation: Rotation;
  readonly zoom: number;
};

/**
 * Keyboard equivalent to the canvas's drag-to-rotate / wheel-to-zoom
 * gestures: arrow keys nudge yaw/pitch by a fixed step, +/- zoom in/out.
 * Returns null for keys that aren't handled, so callers only
 * preventDefault when something actually changed. Pure — same inputs,
 * same result, so it's the one place this math is written and tested.
 */
export function canvasKeyboardInteraction(
  key: string,
  rotation: Rotation,
  zoom: number,
  bounds: CanvasKeyboardBounds
): CanvasKeyboardResult | null {
  switch (key) {
    case 'ArrowLeft':
      return { rotation: { ...rotation, yaw: rotation.yaw - KEYBOARD_ROTATE_STEP }, zoom };
    case 'ArrowRight':
      return { rotation: { ...rotation, yaw: rotation.yaw + KEYBOARD_ROTATE_STEP }, zoom };
    case 'ArrowUp':
      return {
        rotation: { ...rotation, pitch: Math.min(bounds.pitchLimit, rotation.pitch + KEYBOARD_ROTATE_STEP) },
        zoom,
      };
    case 'ArrowDown':
      return {
        rotation: { ...rotation, pitch: Math.max(-bounds.pitchLimit, rotation.pitch - KEYBOARD_ROTATE_STEP) },
        zoom,
      };
    case '+':
    case '=':
      return { rotation, zoom: Math.min(bounds.zoomMax, zoom * KEYBOARD_ZOOM_FACTOR) };
    case '-':
    case '_':
      return { rotation, zoom: Math.max(bounds.zoomMin, zoom / KEYBOARD_ZOOM_FACTOR) };
    default:
      return null;
  }
}
