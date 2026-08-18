'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AttractorCanvas, type AttractorCanvasHandle, type CanvasMetrics } from '@/components/canvas/AttractorCanvas';
import {
  DivergencePairCanvas,
  type DivergenceMetrics,
  type DivergencePairCanvasHandle,
} from '@/components/divergence/DivergencePairCanvas';
import { SeparationPlot, type SeparationPlotHandle } from '@/components/divergence/SeparationPlot';
import { AppNav } from '@/components/nav/AppNav';
import { OnboardingHint } from '@/components/onboarding/OnboardingHint';
import { ControlPanel, INTEGRATOR_LABEL, SYSTEM_LABEL } from '@/components/panel/ControlPanel';
import { ReadoutStrip } from '@/components/readout/ReadoutStrip';
import { exportPlotterSvg } from '@/lib/export/plotter';
import { downloadSvg } from '@/lib/export/download';
import { useT } from '@/lib/i18n/LocaleProvider';
import type { IntegratorId } from '@/lib/dynamics/integrate';
import { classicSystem, type System, type SystemId } from '@/lib/dynamics/systems';
import { decodeJelajahState, encodeJelajahState } from '@/lib/permalink';

export default function JelajahPage() {
  const t = useT();
  const [systemId, setSystemId] = useState<SystemId>('lorenz');
  const [params, setParams] = useState<Record<string, number>>({
    ...classicSystem.lorenz.params,
  });
  const [integrator, setIntegrator] = useState<IntegratorId>('rk4');
  const [dt, setDt] = useState(0.005);
  const [pairMode, setPairMode] = useState(true);
  const [epsilon, setEpsilon] = useState(1e-8);
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState<CanvasMetrics | DivergenceMetrics>({
    elapsed: 0,
    lyapunovMax: undefined,
  });
  const separationPlotRef = useRef<SeparationPlotHandle | null>(null);
  const attractorCanvasRef = useRef<AttractorCanvasHandle | null>(null);
  const pairCanvasRef = useRef<DivergencePairCanvasHandle | null>(null);

  // A permalink is only meaningful if it can override every field it
  // encodes, once, before anything else touches state — applied here rather
  // than folded into the initial useState calls so it works identically
  // whether the query string came from a shared link or a same-origin
  // navigation (e.g. the bifurcation-diagram jump).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const decoded = decodeJelajahState(window.location.search.replace(/^\?/, ''));
    if (Object.keys(decoded).length === 0) return;
    const nextSystemId = decoded.systemId ?? systemId;
    setSystemId(nextSystemId);
    setParams(decoded.params ?? { ...classicSystem[nextSystemId].params });
    if (decoded.integrator) setIntegrator(decoded.integrator);
    if (decoded.dt !== undefined) setDt(decoded.dt);
    if (decoded.pairMode !== undefined) setPairMode(decoded.pairMode);
    if (decoded.epsilon !== undefined) setEpsilon(decoded.epsilon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps the URL a live mirror of state — same inputs produce a
  // byte-identical trajectory (CLAUDE.md invariant 3), so the address bar
  // itself becomes a reproducible reference to whatever is on screen.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = encodeJelajahState({ systemId, params, integrator, dt, pairMode, epsilon });
    window.history.replaceState(null, '', `${window.location.pathname}?${search}`);
  }, [systemId, params, integrator, dt, pairMode, epsilon]);

  const handleSystemChange = (id: SystemId) => {
    setSystemId(id);
    setParams({ ...classicSystem[id].params });
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
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
      <div className="relative h-[60vh] sm:h-auto sm:flex-1">
        <AppNav />
        <OnboardingHint
          storageKey="attractor-lab-onboarding"
          message={pairMode ? `${t.onboarding.intro} ${t.onboarding.divergenceHint}` : t.onboarding.intro}
        />
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
          onCopyLink={handleCopyLink}
          copied={copied}
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
