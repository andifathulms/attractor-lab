'use client';

import { useMemo, useRef, useState } from 'react';
import { AttractorCanvas, type CanvasMetrics } from '@/components/canvas/AttractorCanvas';
import {
  DivergencePairCanvas,
  type DivergenceMetrics,
} from '@/components/divergence/DivergencePairCanvas';
import { SeparationPlot, type SeparationPlotHandle } from '@/components/divergence/SeparationPlot';
import { AppNav } from '@/components/nav/AppNav';
import { ControlPanel } from '@/components/panel/ControlPanel';
import { ReadoutStrip } from '@/components/readout/ReadoutStrip';
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

  const handleSystemChange = (id: SystemId) => {
    setSystemId(id);
    setParams({ ...classicSystem[id].params });
  };

  const system = useMemo(() => ({ type: systemId, params }) as System, [systemId, params]);
  const integratorConfig = useMemo(() => ({ type: integrator }), [integrator]);

  return (
    <main className="flex h-dvh flex-col bg-night">
      <div className="relative flex-1">
        <AppNav />
        {pairMode ? (
          <DivergencePairCanvas
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
