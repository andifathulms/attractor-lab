'use client';

import { useMemo, useRef, useState } from 'react';
import { SectionCanvas, type SectionMetrics } from '@/components/section/SectionCanvas';
import { SectionPanel } from '@/components/section/SectionPanel';
import { SectionPlot, type SectionPlotHandle } from '@/components/section/SectionPlot';
import { SectionReadoutStrip } from '@/components/section/SectionReadoutStrip';
import { invariants } from '@/lib/dynamics/invariants';
import type { Plane } from '@/lib/dynamics/section';
import { classicSystem, type System, type SystemId } from '@/lib/dynamics/systems';

function defaultPlane(systemId: SystemId): Plane {
  const box = invariants[systemId]?.boundingBox;
  const offset = box ? (box.min[2] + box.max[2]) / 2 : 0;
  return { axis: 2, offset };
}

export default function IrisanPage() {
  const [systemId, setSystemId] = useState<SystemId>('lorenz');
  const [params, setParams] = useState<Record<string, number>>({
    ...classicSystem.lorenz.params,
  });
  const [dt, setDt] = useState(0.005);
  const [plane, setPlane] = useState<Plane>(() => defaultPlane('lorenz'));
  const [collapsed, setCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<SectionMetrics>({ elapsed: 0, crossingCount: 0 });
  const sectionPlotRef = useRef<SectionPlotHandle | null>(null);

  const handleSystemChange = (id: SystemId) => {
    setSystemId(id);
    setParams({ ...classicSystem[id].params });
    setPlane(defaultPlane(id));
  };

  const handlePlaneChange = (next: Plane) => {
    setPlane(next);
    sectionPlotRef.current?.reset();
  };

  const system = useMemo(() => ({ type: systemId, params }) as System, [systemId, params]);

  return (
    <main className="flex h-dvh flex-col bg-night">
      <div className="relative flex-1">
        <SectionCanvas
          system={system}
          dt={dt}
          plane={plane}
          onMetrics={setMetrics}
          onCrossings={(crossings) => sectionPlotRef.current?.pushCrossings(crossings)}
        />
        <SectionPanel
          systemId={systemId}
          onSystemChange={handleSystemChange}
          params={params}
          onParamsChange={setParams}
          dt={dt}
          onDtChange={setDt}
          plane={plane}
          onPlaneChange={handlePlaneChange}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>
      <SectionPlot ref={sectionPlotRef} plane={plane} />
      <SectionReadoutStrip
        dt={dt}
        elapsed={metrics.elapsed}
        plane={plane}
        crossingCount={metrics.crossingCount}
      />
    </main>
  );
}
