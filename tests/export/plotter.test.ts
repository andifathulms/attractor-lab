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
});
