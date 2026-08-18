import Link from 'next/link';
import { useLocale, useT } from '@/lib/i18n/LocaleProvider';
import type { IntegratorId } from '@/lib/dynamics/integrate';
import type { SystemId } from '@/lib/dynamics/systems';
import { usePanelFocusOnToggle } from '@/lib/usePanelFocus';

export const SYSTEM_LABEL: Record<SystemId, string> = {
  lorenz: 'Lorenz',
  rossler: 'Rössler',
  thomas: 'Thomas',
  halvorsen: 'Halvorsen',
  aizawa: 'Aizawa',
};

export const INTEGRATOR_LABEL: Record<IntegratorId, string> = {
  euler: 'Euler',
  rk2: 'RK2',
  rk4: 'RK4',
};

export type ControlPanelProps = {
  readonly systemId: SystemId;
  readonly onSystemChange: (id: SystemId) => void;
  readonly params: Record<string, number>;
  readonly onParamsChange: (params: Record<string, number>) => void;
  readonly integrator: IntegratorId;
  readonly onIntegratorChange: (id: IntegratorId) => void;
  readonly dt: number;
  readonly onDtChange: (dt: number) => void;
  readonly pairMode: boolean;
  readonly onPairModeChange: (pairMode: boolean) => void;
  readonly epsilon: number;
  readonly onEpsilonChange: (epsilon: number) => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
  readonly onExport: () => void;
  readonly onCopyLink: () => void;
  readonly copied: boolean;
  readonly onVerify: () => void;
  readonly verifying: boolean;
  readonly verifyDelta: number | undefined;
  readonly verifyDeltaFraction: number | undefined;
  readonly canVerify: boolean;
};

export function ControlPanel({
  systemId,
  onSystemChange,
  params,
  onParamsChange,
  integrator,
  onIntegratorChange,
  dt,
  onDtChange,
  pairMode,
  onPairModeChange,
  epsilon,
  onEpsilonChange,
  collapsed,
  onToggleCollapsed,
  onExport,
  onCopyLink,
  copied,
  onVerify,
  verifying,
  verifyDelta,
  verifyDeltaFraction,
  canVerify,
}: ControlPanelProps) {
  const t = useT();
  const locale = useLocale();
  const { openButtonRef, closeButtonRef } = usePanelFocusOnToggle(collapsed);

  if (collapsed) {
    return (
      <button
        ref={openButtonRef}
        type="button"
        onClick={onToggleCollapsed}
        aria-label={t.panel.openPanel}
        className="fixed inset-x-0 bottom-0 z-20 w-full border-t border-rule bg-night/90 py-3 text-center font-sans text-sm text-readout transition-colors duration-fast hover:bg-graticule sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-8 sm:z-auto sm:w-auto sm:rounded-l sm:rounded-r-none sm:border sm:border-r-0 sm:border-t-0 sm:px-2 sm:py-4"
      >
        ⟨
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-32 z-20 max-h-[40vh] overflow-y-auto border-t border-rule bg-night/95 p-4 font-sans text-sm text-readout sm:absolute sm:inset-x-auto sm:right-4 sm:top-8 sm:bottom-auto sm:z-auto sm:max-h-none sm:w-72 sm:overflow-visible sm:rounded sm:border sm:bg-night/90 sm:backdrop-blur-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">{t.panel.title}</h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onToggleCollapsed}
          aria-label={t.panel.closePanel}
          className="text-readout transition-colors duration-fast hover:text-bloom"
        >
          ⟩
        </button>
      </div>
      <p className="mb-4 text-sm leading-snug text-caption">{t.panel.intro}</p>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm text-caption">{t.panel.system}</span>
        <select
          value={systemId}
          onChange={(event) => onSystemChange(event.target.value as SystemId)}
          className="w-full rounded border border-rule bg-graticule px-2 py-1 text-readout"
        >
          {(Object.keys(SYSTEM_LABEL) as SystemId[]).map((id) => (
            <option key={id} value={id}>
              {t.systemNames[id]}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm text-caption">{t.panel.integrator}</span>
        <select
          value={integrator}
          onChange={(event) => onIntegratorChange(event.target.value as IntegratorId)}
          className="w-full rounded border border-rule bg-graticule px-2 py-1 text-readout"
        >
          {(Object.keys(INTEGRATOR_LABEL) as IntegratorId[]).map((id) => (
            <option key={id} value={id}>
              {t.integratorNames[id]}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm text-caption">{t.panel.step}</span>
        <input
          type="number"
          value={dt}
          step={0.0005}
          min={0.0001}
          max={0.05}
          onChange={(event) => onDtChange(Number(event.target.value))}
          className="w-full rounded border border-rule bg-graticule px-2 py-1 font-mono text-readout"
        />
      </label>

      <p className="mb-4 text-sm leading-snug text-caption">
        {t.panel.tryCompareCuePrefix}{' '}
        <Link
          href={`/${locale}/banding`}
          className="text-readout underline decoration-rule underline-offset-2 transition-colors duration-fast hover:text-bloom hover:decoration-bloom"
        >
          {t.nav.banding}
        </Link>
        {t.panel.tryCompareCueSuffix}
      </p>

      <label className="mb-4 flex items-center justify-between">
        <span className="text-sm text-caption">{t.panel.pairMode}</span>
        <input
          type="checkbox"
          checked={pairMode}
          onChange={(event) => onPairModeChange(event.target.checked)}
          className="h-4 w-4 accent-trail-a"
        />
      </label>

      {pairMode && (
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-caption">{t.panel.epsilon}</span>
          <input
            type="number"
            value={epsilon}
            step={epsilon / 10}
            min={1e-15}
            max={1}
            onChange={(event) => onEpsilonChange(Number(event.target.value))}
            className="w-full rounded border border-rule bg-graticule px-2 py-1 font-mono text-readout"
          />
        </label>
      )}

      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm text-caption">{t.panel.parameters}</legend>
        {Object.entries(params).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between gap-2">
            <span className="font-display italic">{key}</span>
            <input
              type="number"
              value={value}
              step={0.01}
              onChange={(event) =>
                onParamsChange({ ...params, [key]: Number(event.target.value) })
              }
              className="w-24 rounded border border-rule bg-graticule px-2 py-1 font-mono text-readout"
            />
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={onExport}
        className="mt-4 w-full rounded border border-trail-a bg-trail-a px-2 py-1.5 font-medium text-night transition-colors duration-fast hover:border-bloom hover:bg-bloom"
      >
        {t.panel.exportSvg}
      </button>

      <button
        type="button"
        onClick={onCopyLink}
        aria-live="polite"
        className="mt-2 w-full rounded border border-rule bg-graticule px-2 py-1.5 text-readout transition-colors duration-fast hover:bg-rule"
      >
        {copied ? t.panel.linkCopied : t.panel.copyLink}
      </button>

      <button
        type="button"
        onClick={onVerify}
        disabled={!canVerify || verifying}
        aria-live="polite"
        className="mt-2 w-full rounded border border-rule bg-graticule px-2 py-1.5 text-readout transition-colors duration-fast hover:bg-rule disabled:opacity-50"
      >
        {verifying ? t.panel.verifying : t.panel.verify}
      </button>
      {verifyDelta !== undefined && (
        <p
          role="status"
          className="mt-2 text-right font-mono text-sm text-caption [font-variant-numeric:tabular-nums]"
        >
          {t.panel.verifyDeltaLabel}: {verifyDelta.toExponential(2)}
          {verifyDeltaFraction !== undefined &&
            ` (${(verifyDeltaFraction * 100).toPrecision(2)}% ${t.panel.verifyDeltaScaleSuffix})`}
        </p>
      )}
    </div>
  );
}
