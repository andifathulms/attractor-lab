'use client';

import { useMemo, useRef, useState } from 'react';
import { AttractorCanvas, type AttractorCanvasHandle, type CanvasMetrics } from '@/components/canvas/AttractorCanvas';
import {
  DivergencePairCanvas,
  type DivergenceMetrics,
  type DivergencePairCanvasHandle,
} from '@/components/divergence/DivergencePairCanvas';
import { SeparationPlot, type SeparationPlotHandle } from '@/components/divergence/SeparationPlot';
import { AppNav } from '@/components/nav/AppNav';
import { ControlPanel, INTEGRATOR_LABEL, SYSTEM_LABEL } from '@/components/panel/ControlPanel';
import { ReadoutStrip } from '@/components/readout/ReadoutStrip';
import { exportPlotterSvg } from '@/lib/export/plotter';
import { downloadSvg } from '@/lib/export/download';
import type { IntegratorId } from '@/lib/dynamics/integrate';
import { classicSystem, type System, type SystemId } from '@/lib/dynamics/systems';

export default function JelajahPage() {
  const [systemId, setSystemId] = useState<SystemId>('lorenz');
  const [params, setParams] = useState<Record<string, number>>({
    ...classicSystem.lorenz.params,
  });
  const [integrator, setIntegrator] = useState<IntegratorId>('rk4');
  const [dt, setDt] = useState(0.005);
  const [pairMode, setPairMode] = useState(true);
  const [epsilon, setEpsilon] = useState(1e-8);
  const [collapsed, setCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<CanvasMetrics | DivergenceMetrics>({
    elapsed: 0,
    lyapunovMax: undefined,
  });
  const separationPlotRef = useRef<SeparationPlotHandle | null>(null);
  const attractorCanvasRef = useRef<AttractorCanvasHandle | null>(null);
  const pairCanvasRef = useRef<DivergencePairCanvasHandle | null>(null);

  const handleSystemChange = (id: SystemId) => {
    setSystemId(id);
    setParams({ ...classicSystem[id].params });
  };

  const system = useMemo(() => ({ type: systemId, params }) as System, [systemId, params]);
  const integratorConfig = useMemo(() => ({ type: integrator }), [integrator]);

  const handleExport = () => {
    const snapshot = pairMode ? pairCanvasRef.current?.getSnapshot() : attractorCanvasRef.current?.getSnapshot();
    if (!snapshot || snapshot.trajectories.every((t) => t.length === 0)) return;

    const svg = exportPlotterSvg(
      snapshot.trajectories,
      {
        systemName: SYSTEM_LABEL[systemId],
        params,
        integrator: INTEGRATOR_LABEL[integrator],
        dt,
      },
      {
        paperWidthMm: 210,
        paperHeightMm: 297,
        marginMm: 15,
        strokeWidthMm: 0.15,
        maxNodes: 8000,
        rotation: snapshot.rotation,
      }
    );
    downloadSvg(svg, `attractor-lab-${systemId}.svg`);
  };

  return (
    <main className="flex h-dvh flex-col bg-night">
      <div className="relative flex-1">
        <AppNav />
        {pairMode ? (
          <DivergencePairCanvas
            ref={pairCanvasRef}
            system={system}
            integrator={integratorConfig}
            dt={dt}
            epsilon={epsilon}
            onMetrics={setMetrics}
            onSeparationBatch={(times, separations) =>
              separationPlotRef.current?.pushSamples(times, separations)
            }
            onReset={() => separationPlotRef.current?.reset()}
          />
        ) : (
          <AttractorCanvas
            ref={attractorCanvasRef}
            system={system}
            integrator={integratorConfig}
            dt={dt}
            onMetrics={setMetrics}
          />
        )}
        <ControlPanel
          systemId={systemId}
          onSystemChange={handleSystemChange}
          params={params}
          onParamsChange={setParams}
          integrator={integrator}
          onIntegratorChange={setIntegrator}
          dt={dt}
          onDtChange={setDt}
          pairMode={pairMode}
          onPairModeChange={setPairMode}
          epsilon={epsilon}
          onEpsilonChange={setEpsilon}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onExport={handleExport}
        />
      </div>
      {pairMode && <SeparationPlot ref={separationPlotRef} epsilon={epsilon} />}
      <ReadoutStrip
        integrator={integrator}
        dt={dt}
        elapsed={metrics.elapsed}
        lyapunovMax={metrics.lyapunovMax}
        pairMode={pairMode}
        epsilon={epsilon}
      />
    </main>
  );
}
