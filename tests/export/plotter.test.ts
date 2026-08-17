import { describe, expect, it } from 'vitest';
import { exportPlotterSvg, type PlotterExportConfig, type PlotterExportMeta } from '../../lib/export/plotter';
import { integrateTrajectory } from '../../lib/dynamics/trajectory';
import { classicSystem } from '../../lib/dynamics/systems';

function countPathNodes(svg: string): number {
  const paths = [...svg.matchAll(/<path d="([^"]*)"/g)].map((m) => m[1] as string);
  let count = 0;
  for (const d of paths) {
    count += (d.match(/M |L /g) ?? []).length;
  }
  return count;
}

describe('plotter SVG export', () => {
  const trajectory = integrateTrajectory(
    classicSystem.lorenz,
    { type: 'rk4' },
    new Float64Array([0.1, 0.1, 0.1]),
    0.005,
    20000
  );

  const meta: PlotterExportMeta = {
    systemName: 'Lorenz',
    params: classicSystem.lorenz.params,
    integrator: 'RK4',
    dt: 0.005,
  };

  const config: PlotterExportConfig = {
    paperWidthMm: 210,
    paperHeightMm: 297,
    marginMm: 15,
    strokeWidthMm: 0.15,
    maxNodes: 2000,
    rotation: { yaw: 0.6, pitch: -0.3 },
  };

  const svg = exportPlotterSvg([trajectory], meta, config);

  it('contains no fill other than none', () => {
    const fills = [...svg.matchAll(/fill="([^"]*)"/g)].map((m) => m[1]);
    expect(fills.length).toBeGreaterThan(0);
    for (const fill of fills) {
      expect(fill).toBe('none');
    }
  });

  it('contains no opacity attributes', () => {
    expect(svg).not.toMatch(/opacity/);
  });

  it('uses a single stroke weight throughout', () => {
    const widths = new Set([...svg.matchAll(/stroke-width="([^"]*)"/g)].map((m) => m[1]));
    expect(widths.size).toBe(1);
    expect(widths.has(String(config.strokeWidthMm))).toBe(true);
  });

  it('carries physical dimensions in millimetres', () => {
    expect(svg).toMatch(/width="210mm"/);
    expect(svg).toMatch(/height="297mm"/);
  });

  it('carries a caption with system, parameters, integrator, and step', () => {
    expect(svg).toContain('Lorenz');
    expect(svg).toContain('RK4');
    expect(svg).toContain('0.005');
  });

  it('is path-simplified under the plotter node budget', () => {
    expect(countPathNodes(svg)).toBeLessThanOrEqual(config.maxNodes);
  });

  it('produces no path when given an empty trajectory', () => {
    const empty = exportPlotterSvg([[]], meta, config);
    expect(empty).not.toContain('<path');
  });

  it('fits multiple trajectories to a shared coordinate frame, not independently', () => {
    // Two trajectories occupying very different regions of space: a small
    // cluster near the origin, and one far away. Fit independently, both
    // would be stretched to fill the whole page and land on top of each
    // other. Fit to a shared frame, the far-away one must land near one
    // edge of the page while the small cluster stays compact near the
    // other edge — proof the two share one coordinate system.
    const near: Float64Array[] = [
      new Float64Array([0, 0, 0]),
      new Float64Array([0.001, 0.001, 0]),
    ];
    const far: Float64Array[] = [
      new Float64Array([100, 100, 0]),
      new Float64Array([100.001, 100.001, 0]),
    ];

    const svg = exportPlotterSvg([near, far], meta, { ...config, maxNodes: 20 });
    const paths = [...svg.matchAll(/<path d="([^"]*)"/g)].map((m) => m[1] as string);
    expect(paths.length).toBe(2);

    const firstCoord = (d: string): number => Number(d.match(/M ([\d.]+) ([\d.]+)/)?.[1]);
    const nearX = firstCoord(paths[0] as string);
    const farX = firstCoord(paths[1] as string);
    // If each trajectory were fit independently, both would sit near the
    // page center regardless of their real separation. Fit to a shared
    // frame, "near" (close to the origin) must land far from "far".
    expect(Math.abs(nearX - farX)).toBeGreaterThan(50);
  });
});
