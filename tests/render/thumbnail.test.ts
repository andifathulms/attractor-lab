import { describe, expect, it } from 'vitest';
import { classicSystem } from '../../lib/dynamics/systems';
import { buildFlowThumbnail } from '../../lib/render/thumbnail';

describe('buildFlowThumbnail', () => {
  it('produces an SVG path starting with a move command', () => {
    const thumbnail = buildFlowThumbnail(classicSystem.lorenz);
    expect(thumbnail.d.startsWith('M ')).toBe(true);
  });

  it('is deterministic for the same system', () => {
    const a = buildFlowThumbnail(classicSystem.lorenz);
    const b = buildFlowThumbnail(classicSystem.lorenz);
    expect(a.d).toBe(b.d);
  });

  it('fits every point inside its own viewBox', () => {
    const thumbnail = buildFlowThumbnail(classicSystem.rossler);
    const [, , width, height] = thumbnail.viewBox.split(' ').map(Number);
    const coords = thumbnail.d.match(/-?\d+\.\d+/g) ?? [];
    for (let i = 0; i + 1 < coords.length; i += 2) {
      const x = Number(coords[i]);
      const y = Number(coords[i + 1]);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(width as number);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(height as number);
    }
  });

  it('produces different paths for different systems', () => {
    const lorenz = buildFlowThumbnail(classicSystem.lorenz);
    const thomas = buildFlowThumbnail(classicSystem.thomas);
    expect(lorenz.d).not.toBe(thomas.d);
  });
});
