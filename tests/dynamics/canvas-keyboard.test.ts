import { describe, expect, it } from 'vitest';
import {
  canvasKeyboardInteraction,
  KEYBOARD_ROTATE_STEP,
  KEYBOARD_ZOOM_FACTOR,
} from '../../lib/canvas-keyboard';

const bounds = { pitchLimit: 1, zoomMin: 1, zoomMax: 60 };
const rotation = { yaw: 0, pitch: 0 };

describe('canvasKeyboardInteraction', () => {
  it('rotates yaw with ArrowLeft/ArrowRight', () => {
    expect(canvasKeyboardInteraction('ArrowRight', rotation, 8, bounds)?.rotation.yaw).toBeCloseTo(
      KEYBOARD_ROTATE_STEP,
      10
    );
    expect(canvasKeyboardInteraction('ArrowLeft', rotation, 8, bounds)?.rotation.yaw).toBeCloseTo(
      -KEYBOARD_ROTATE_STEP,
      10
    );
  });

  it('rotates pitch with ArrowUp/ArrowDown, clamped to pitchLimit', () => {
    expect(canvasKeyboardInteraction('ArrowUp', rotation, 8, bounds)?.rotation.pitch).toBeCloseTo(
      KEYBOARD_ROTATE_STEP,
      10
    );
    const atLimit = { yaw: 0, pitch: bounds.pitchLimit };
    expect(canvasKeyboardInteraction('ArrowUp', atLimit, 8, bounds)?.rotation.pitch).toBe(bounds.pitchLimit);
  });

  it('zooms with +/- and =/_ , clamped to zoomMin/zoomMax', () => {
    expect(canvasKeyboardInteraction('+', rotation, 8, bounds)?.zoom).toBeCloseTo(8 * KEYBOARD_ZOOM_FACTOR, 10);
    expect(canvasKeyboardInteraction('=', rotation, 8, bounds)?.zoom).toBeCloseTo(8 * KEYBOARD_ZOOM_FACTOR, 10);
    expect(canvasKeyboardInteraction('-', rotation, 8, bounds)?.zoom).toBeCloseTo(8 / KEYBOARD_ZOOM_FACTOR, 10);
    expect(canvasKeyboardInteraction('_', rotation, 8, bounds)?.zoom).toBeCloseTo(8 / KEYBOARD_ZOOM_FACTOR, 10);
    expect(canvasKeyboardInteraction('+', rotation, 59, bounds)?.zoom).toBe(bounds.zoomMax);
    expect(canvasKeyboardInteraction('-', rotation, 1.05, bounds)?.zoom).toBe(bounds.zoomMin);
  });

  it('returns null for an unhandled key', () => {
    expect(canvasKeyboardInteraction('a', rotation, 8, bounds)).toBeNull();
    expect(canvasKeyboardInteraction('Tab', rotation, 8, bounds)).toBeNull();
  });
});
