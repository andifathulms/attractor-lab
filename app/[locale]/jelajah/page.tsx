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
import { boundingBoxDiagonal, predictabilityHorizon, separationThreshold } from '@/lib/predictability';
import type { ResultMessage, StartMessage as VerifyStartMessage, WorkerOutboundMessage as VerifyOutboundMessage } from '@/workers/verify.worker';

const VERIFY_INITIAL_STATE: readonly [number, number, number] = [0.1, 0.1, 0.1];
// Bounds the worker's compute: re-running at dt and dt/2 costs ~3x the
// steps taken so far, and this is a one-shot check, not the streaming
// render — no need to match the full run for the claim to be meaningful.
const MAX_VERIFY_STEPS = 20000;

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
  const [verifying, setVerifying] = useState(false);
  const [verifyDelta, setVerifyDelta] = useState<number | undefined>(undefined);
  const [metrics, setMetrics] = useState<CanvasMetrics | DivergenceMetrics>({
    elapsed: 0,
    lyapunovMax: undefined,
  });
  const [latestSeparation, setLatestSeparation] = useState<number | undefined>(undefined);
  const separationPlotRef = useRef<SeparationPlotHandle | null>(null);
  const attractorCanvasRef = useRef<AttractorCanvasHandle | null>(null);
  const pairCanvasRef = useRef<DivergencePairCanvasHandle | null>(null);
  // Dismissing the onboarding hint unmounts its own just-focused button;
  // this gives focus somewhere sensible to land on afterward instead of
  // dropping to <body>. tabIndex=-1 makes <main> programmatically
  // focusable without adding it to the normal Tab order.
  const mainRef = useRef<HTMLElement | null>(null);

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

  // Reruns the current run at dt/2 for the same elapsed time and reports how
  // far the endpoint moves — makes the readout strip's "integrator: RK4,
  // step: 5e-3" a checkable claim about the picture on screen, not just a
  // label. CLAUDE.md §1.2.
  const handleVerify = () => {
    const steps = Math.min(Math.round(metrics.elapsed / dt), MAX_VERIFY_STEPS);
    if (steps <= 0) return;
    setVerifying(true);
    setVerifyDelta(undefined);
    const worker = new Worker(new URL('../../../workers/verify.worker.ts', import.meta.url));
    worker.onmessage = (event: MessageEvent<VerifyOutboundMessage>) => {
      const message: ResultMessage = event.data;
      setVerifyDelta(message.delta);
      setVerifying(false);
      worker.terminate();
    };
    const startMessage: VerifyStartMessage = {
      type: 'start',
      system,
      integrator: integratorConfig,
      initial: VERIFY_INITIAL_STATE,
      dt,
      steps,
    };
    worker.postMessage(startMessage);
  };

  const system = useMemo(() => ({ type: systemId, params }) as System, [systemId, params]);
  const integratorConfig = useMemo(() => ({ type: integrator }), [integrator]);
  const horizon = useMemo(() => {
    if (metrics.lyapunovMax === undefined) return undefined;
    return predictabilityHorizon(metrics.lyapunovMax, epsilon, separationThreshold(systemId));
  }, [metrics.lyapunovMax, epsilon, systemId]);
  // Frames the verify-check's raw distance against the attractor's own
  // physical scale (CLAUDE.md invariant 12's bounding box), so the number
  // reads as "how much of the picture" rather than an uninterpretable
  // magnitude.
  const verifyDeltaFraction = useMemo(() => {
    if (verifyDelta === undefined) return undefined;
    return verifyDelta / boundingBoxDiagonal(systemId);
  }, [verifyDelta, systemId]);

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
    <main ref={mainRef} tabIndex={-1} className="flex h-dvh flex-col bg-night">
      <div className="relative h-[60vh] sm:h-auto sm:flex-1">
        <AppNav />
        <OnboardingHint
          storageKey="attractor-lab-onboarding"
          message={pairMode ? `${t.onboarding.intro} ${t.onboarding.divergenceHint}` : t.onboarding.intro}
          returnFocusRef={mainRef}
        />
        {pairMode ? (
          <DivergencePairCanvas
            ref={pairCanvasRef}
            system={system}
            integrator={integratorConfig}
            dt={dt}
            epsilon={epsilon}
            onMetrics={setMetrics}
            onSeparationBatch={(times, separations) => {
              separationPlotRef.current?.pushSamples(times, separations);
              const last = separations[separations.length - 1];
              if (last !== undefined) setLatestSeparation(last);
            }}
            onReset={() => {
              separationPlotRef.current?.reset();
              setLatestSeparation(undefined);
            }}
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
          onVerify={handleVerify}
          verifying={verifying}
          verifyDelta={verifyDelta}
          verifyDeltaFraction={verifyDeltaFraction}
          canVerify={metrics.elapsed > 0}
        />
      </div>
      {pairMode && (
        <SeparationPlot
          ref={separationPlotRef}
          epsilon={epsilon}
          elapsed={metrics.elapsed}
          latestSeparation={latestSeparation}
          lyapunovMax={metrics.lyapunovMax}
        />
      )}
      <ReadoutStrip
        integrator={integrator}
        dt={dt}
        elapsed={metrics.elapsed}
        lyapunovMax={metrics.lyapunovMax}
        pairMode={pairMode}
        epsilon={epsilon}
        horizon={horizon}
      />
    </main>
  );
}
