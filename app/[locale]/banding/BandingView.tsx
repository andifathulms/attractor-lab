'use client';

import { useMemo, useState } from 'react';
import { ComparisonCanvas, type ComparisonMetrics } from '@/components/comparison/ComparisonCanvas';
import { ComparisonPanel } from '@/components/comparison/ComparisonPanel';
import { ComparisonReadoutStrip } from '@/components/comparison/ComparisonReadoutStrip';
import { AppNav } from '@/components/nav/AppNav';
import { estimateConvergenceOrders, type ConvergenceOrders } from '@/lib/dynamics/convergence';
import { classicSystem, type System, type SystemId } from '@/lib/dynamics/systems';

const CONVERGENCE_CHECK_DURATION = 0.2;

export function BandingView() {
  const [systemId, setSystemId] = useState<SystemId>('lorenz');
  const [params, setParams] = useState<Record<string, number>>({
    ...classicSystem.lorenz.params,
  });
  const [dt, setDt] = useState(0.01);
  const [collapsed, setCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<ComparisonMetrics>({
    elapsed: 0,
    eulerVsRk4: 0,
    rk2VsRk4: 0,
  });
  const [convergence, setConvergence] = useState<ConvergenceOrders | undefined>(undefined);

  const handleSystemChange = (id: SystemId) => {
    setSystemId(id);
    setParams({ ...classicSystem[id].params });
    setConvergence(undefined);
  };

  const system = useMemo(() => ({ type: systemId, params }) as System, [systemId, params]);

  const handleCheckConvergence = () => {
    const initial = new Float64Array([1, 1, 1]);
    setConvergence(estimateConvergenceOrders(system, initial, dt, CONVERGENCE_CHECK_DURATION));
  };

  return (
    <main className="flex h-dvh flex-col bg-night">
      <div className="relative h-[60vh] sm:h-auto sm:flex-1">
        <AppNav />
        <ComparisonCanvas system={system} dt={dt} onMetrics={setMetrics} />
        <ComparisonPanel
          systemId={systemId}
          onSystemChange={handleSystemChange}
          params={params}
          onParamsChange={(next) => {
            setParams(next);
            setConvergence(undefined);
          }}
          dt={dt}
          onDtChange={(next) => {
            setDt(next);
            setConvergence(undefined);
          }}
          convergence={convergence}
          onCheckConvergence={handleCheckConvergence}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>
      <ComparisonReadoutStrip
        dt={dt}
        elapsed={metrics.elapsed}
        eulerVsRk4={metrics.eulerVsRk4}
        rk2VsRk4={metrics.rk2VsRk4}
      />
    </main>
  );
}
