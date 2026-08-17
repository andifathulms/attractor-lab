'use client';

import { useMemo, useState } from 'react';
import { BifurcationPanel } from '@/components/bifurcation/BifurcationPanel';
import { BifurcationPlot, type BifurcationProgress } from '@/components/bifurcation/BifurcationPlot';
import { BifurcationReadoutStrip } from '@/components/bifurcation/BifurcationReadoutStrip';
import type { LocalMaximaConfig } from '@/lib/dynamics/bifurcation';
import { classicSystem, type SystemId } from '@/lib/dynamics/systems';

export default function CabangPage() {
  const [systemId, setSystemId] = useState<SystemId>('lorenz');
  const [paramName, setParamName] = useState('rho');
  const [paramMin, setParamMin] = useState(0);
  const [paramMax, setParamMax] = useState(30);
  const [sampleCount, setSampleCount] = useState(300);
  const [axis, setAxis] = useState<0 | 1 | 2>(2);
  const [dt, setDt] = useState(0.005);
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState<BifurcationProgress>({
    sampleIndex: 0,
    sampleCount,
    done: false,
  });

  const baseSystem = classicSystem[systemId];
  const availableParams = Object.keys(baseSystem.params);

  const handleSystemChange = (id: SystemId) => {
    setSystemId(id);
    const firstParam = Object.keys(classicSystem[id].params)[0];
    if (firstParam) setParamName(firstParam);
  };

  const system = useMemo(() => baseSystem, [baseSystem]);
  const config: LocalMaximaConfig = useMemo(
    () => ({ dt, burnInSteps: 4000, sampleSteps: 6000, axis }),
    [dt, axis]
  );

  return (
    <main className="flex h-dvh flex-col bg-night">
      <div className="relative flex-1">
        <BifurcationPlot
          system={system}
          paramName={paramName}
          paramMin={paramMin}
          paramMax={paramMax}
          sampleCount={sampleCount}
          config={config}
          onProgress={setProgress}
        />
        <BifurcationPanel
          systemId={systemId}
          onSystemChange={handleSystemChange}
          paramName={paramName}
          onParamNameChange={setParamName}
          availableParams={availableParams}
          paramMin={paramMin}
          onParamMinChange={setParamMin}
          paramMax={paramMax}
          onParamMaxChange={setParamMax}
          sampleCount={sampleCount}
          onSampleCountChange={setSampleCount}
          axis={axis}
          onAxisChange={setAxis}
          dt={dt}
          onDtChange={setDt}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>
      <BifurcationReadoutStrip
        dt={dt}
        paramName={paramName}
        paramMin={paramMin}
        paramMax={paramMax}
        sampleIndex={progress.sampleIndex}
        sampleCount={progress.sampleCount}
        done={progress.done}
      />
    </main>
  );
}
