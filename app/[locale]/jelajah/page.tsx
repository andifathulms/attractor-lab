'use client';

import { useMemo, useState } from 'react';
import { AttractorCanvas, type CanvasMetrics } from '@/components/canvas/AttractorCanvas';
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
  const [collapsed, setCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<CanvasMetrics>({ elapsed: 0, lyapunovMax: undefined });

  const handleSystemChange = (id: SystemId) => {
    setSystemId(id);
    setParams({ ...classicSystem[id].params });
  };

  const system = useMemo(() => ({ type: systemId, params }) as System, [systemId, params]);
  const integratorConfig = useMemo(() => ({ type: integrator }), [integrator]);

  return (
    <main className="flex h-dvh flex-col bg-night">
      <div className="relative flex-1">
        <AttractorCanvas
          system={system}
          integrator={integratorConfig}
          dt={dt}
          onMetrics={setMetrics}
        />
        <ControlPanel
          systemId={systemId}
          onSystemChange={handleSystemChange}
          params={params}
          onParamsChange={setParams}
          integrator={integrator}
          onIntegratorChange={setIntegrator}
          dt={dt}
          onDtChange={setDt}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>
      <ReadoutStrip
        integrator={integrator}
        dt={dt}
        elapsed={metrics.elapsed}
        lyapunovMax={metrics.lyapunovMax}
      />
    </main>
  );
}
