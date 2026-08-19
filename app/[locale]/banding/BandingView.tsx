'use client';

import { useMemo, useRef, useState } from 'react';
import { ComparisonCanvas, type ComparisonMetrics } from '@/components/comparison/ComparisonCanvas';
import { ComparisonPanel } from '@/components/comparison/ComparisonPanel';
import { ComparisonReadoutStrip } from '@/components/comparison/ComparisonReadoutStrip';
import {
  ComparisonSeparationPlot,
  type ComparisonSeparationPlotHandle,
} from '@/components/comparison/ComparisonSeparationPlot';
import { AppNav } from '@/components/nav/AppNav';
import { estimateConvergenceSeries, type ConvergenceCheckSeries } from '@/lib/convergence-series';
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
  const [convergenceCheck, setConvergenceCheck] = useState<ConvergenceCheckSeries | undefined>(undefined);
  const separationPlotRef = useRef<ComparisonSeparationPlotHandle | null>(null);

  const handleSystemChange = (id: SystemId) => {
    setSystemId(id);
    setParams({ ...classicSystem[id].params });
    setConvergence(undefined);
    setConvergenceCheck(undefined);
  };

  const system = useMemo(() => ({ type: systemId, params }) as System, [systemId, params]);

  const handleCheckConvergence = () => {
    const initial = new Float64Array([1, 1, 1]);
    setConvergence(estimateConvergenceOrders(system, initial, dt, CONVERGENCE_CHECK_DURATION));
    setConvergenceCheck(estimateConvergenceSeries(system, initial, dt, CONVERGENCE_CHECK_DURATION));
  };

  return (
    <main id="main-content" className="flex min-h-dvh flex-col bg-night">
      <div className="relative h-[60vh] sm:h-auto sm:flex-1">
        <AppNav />
        <ComparisonCanvas
          system={system}
          dt={dt}
          onMetrics={setMetrics}
          onSeparationBatch={(times, eulerVsRk4, rk2VsRk4) =>
            separationPlotRef.current?.pushSamples(times, eulerVsRk4, rk2VsRk4)
          }
          onReset={() => separationPlotRef.current?.reset()}
        />
        <ComparisonPanel
          systemId={systemId}
          onSystemChange={handleSystemChange}
          params={params}
          onParamsChange={(next) => {
            setParams(next);
            setConvergence(undefined);
            setConvergenceCheck(undefined);
          }}
          dt={dt}
          onDtChange={(next) => {
            setDt(next);
            setConvergence(undefined);
            setConvergenceCheck(undefined);
          }}
          convergence={convergence}
          onCheckConvergence={handleCheckConvergence}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>
      <ComparisonSeparationPlot ref={separationPlotRef} convergenceCheck={convergenceCheck} />
      <ComparisonReadoutStrip
        dt={dt}
        elapsed={metrics.elapsed}
        eulerVsRk4={metrics.eulerVsRk4}
        rk2VsRk4={metrics.rk2VsRk4}
      />
    </main>
  );
}
