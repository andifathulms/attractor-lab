'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BifurcationPanel } from '@/components/bifurcation/BifurcationPanel';
import { BifurcationPlot, type BifurcationProgress } from '@/components/bifurcation/BifurcationPlot';
import { BifurcationReadoutStrip } from '@/components/bifurcation/BifurcationReadoutStrip';
import { AppNav } from '@/components/nav/AppNav';
import type { LocalMaximaConfig } from '@/lib/dynamics/bifurcation';
import { classicSystem, type SystemId } from '@/lib/dynamics/systems';
import { useT } from '@/lib/i18n/LocaleProvider';
import { encodeJelajahState } from '@/lib/permalink';

const AXIS_LABEL = ['x', 'y', 'z'] as const;

export function CabangView() {
  const router = useRouter();
  const t = useT();
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
  // Keyboard/screen-reader equivalent to clicking a point on the diagram —
  // the click gesture has no keyboard path and no accessible name at all,
  // and it's the only way to reach the jump feature otherwise. A native
  // range input is fully keyboard-operable (arrow keys, Home/End) and
  // gets a real accessible name for free; the separate Jump button lets a
  // keyboard user explore the range before committing, instead of
  // navigating away on every arrow keypress.
  const [selectedParam, setSelectedParam] = useState(0);

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
  const clampedSelectedParam = Math.min(Math.max(selectedParam, paramMin), paramMax);

  // The sweep that produced this diagram always integrates with RK4
  // (lib/dynamics/bifurcation.ts) — the jump carries that forward so the
  // trajectory jelajah renders is the same computation that produced the
  // point being clicked, not a different one that merely starts nearby.
  const handleParamPick = (paramValue: number) => {
    const search = encodeJelajahState({
      systemId,
      params: { ...baseSystem.params, [paramName]: paramValue },
      integrator: 'rk4',
      dt,
      pairMode: true,
      epsilon: 1e-8,
    });
    router.push(`/jelajah?${search}`);
  };

  return (
    <main id="main-content" className="flex min-h-dvh flex-col bg-night">
      <div className="relative h-[60vh] sm:h-auto sm:flex-1">
        <AppNav />
        <BifurcationPlot
          system={system}
          paramName={paramName}
          paramMin={paramMin}
          paramMax={paramMax}
          sampleCount={sampleCount}
          config={config}
          onProgress={setProgress}
          onParamPick={handleParamPick}
        />
        {/* Mobile: top-right, clear of AppNav (top-left) and the bifurcation
            panel's fixed bottom sheet. Desktop: back to bottom-left, where
            the panel instead docks top-right and never reaches this corner. */}
        <p className="pointer-events-none absolute right-4 top-4 z-10 max-w-[10rem] text-right font-mono text-sm text-caption sm:bottom-4 sm:left-4 sm:right-auto sm:top-auto sm:max-w-none sm:text-left">
          {t.panel.clickToJump}
        </p>
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
      {/* What's actually plotted, cited where the reader is looking at it —
          not an about page. Read literally, one local maximum per sweep
          sample; a single dot vs. a smeared column is the whole story of
          periodic-vs-chaotic this diagram exists to show. */}
      <p className="w-full border-t border-rule bg-night px-4 pt-3 font-mono text-sm leading-snug text-caption">
        {t.panel.bifurcationExplain.replace('{axis}', AXIS_LABEL[axis])}
      </p>
      <div className="flex w-full flex-wrap items-center gap-3 bg-night px-4 py-3">
        <label className="flex flex-1 items-center gap-3 font-mono text-sm text-readout">
          <span className="shrink-0 text-caption">
            {t.panel.sweptParameter} ({paramName})
          </span>
          <input
            type="range"
            min={paramMin}
            max={paramMax}
            step={(paramMax - paramMin) / 500 || 0.001}
            value={clampedSelectedParam}
            onChange={(event) => setSelectedParam(Number(event.target.value))}
            aria-label={`${t.panel.sweptParameter} (${paramName})`}
            className="min-w-0 flex-1"
          />
          <span className="w-16 shrink-0 text-right [font-variant-numeric:tabular-nums]">
            {clampedSelectedParam.toPrecision(4)}
          </span>
        </label>
        <button
          type="button"
          onClick={() => handleParamPick(clampedSelectedParam)}
          className="shrink-0 rounded border border-rule bg-graticule px-3 py-1.5 text-sm text-readout transition-colors duration-fast hover:bg-rule"
        >
          {t.panel.jumpToTrajectory}
        </button>
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
