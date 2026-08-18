import { useT } from '@/lib/i18n/LocaleProvider';
import type { ConvergenceOrders } from '@/lib/dynamics/convergence';
import type { SystemId } from '@/lib/dynamics/systems';
import { usePanelFocusOnToggle } from '@/lib/usePanelFocus';
import { EULER_COLOR, RK2_COLOR, RK4_COLOR } from './ComparisonCanvas';

const SYSTEM_LABEL: Record<SystemId, string> = {
  lorenz: 'Lorenz',
  rossler: 'Rössler',
  thomas: 'Thomas',
  halvorsen: 'Halvorsen',
  aizawa: 'Aizawa',
};

export type ComparisonPanelProps = {
  readonly systemId: SystemId;
  readonly onSystemChange: (id: SystemId) => void;
  readonly params: Record<string, number>;
  readonly onParamsChange: (params: Record<string, number>) => void;
  readonly dt: number;
  readonly onDtChange: (dt: number) => void;
  readonly convergence: ConvergenceOrders | undefined;
  readonly onCheckConvergence: () => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
};

export function ComparisonPanel({
  systemId,
  onSystemChange,
  params,
  onParamsChange,
  dt,
  onDtChange,
  convergence,
  onCheckConvergence,
  collapsed,
  onToggleCollapsed,
}: ComparisonPanelProps) {
  const t = useT();
  const { openButtonRef, closeButtonRef } = usePanelFocusOnToggle(collapsed);

  if (collapsed) {
    return (
      <button
        ref={openButtonRef}
        type="button"
        onClick={onToggleCollapsed}
        aria-label={t.panel.openPanel}
        className="w-full border-t border-rule bg-night/90 py-3 text-center font-sans text-sm text-readout transition-colors duration-fast hover:bg-graticule sm:absolute sm:right-0 sm:top-8 sm:w-auto sm:rounded-l sm:rounded-r-none sm:border sm:border-r-0 sm:border-t-0 sm:px-2 sm:py-4"
      >
        ⟨
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-24 z-20 max-h-[40vh] overflow-y-auto border-t border-rule bg-night/95 p-4 font-sans text-sm text-readout sm:absolute sm:inset-x-auto sm:right-4 sm:top-8 sm:bottom-auto sm:z-auto sm:max-h-none sm:w-72 sm:overflow-visible sm:rounded sm:border sm:bg-night/90 sm:backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
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
        <span className="mb-1 block text-sm text-caption">{t.panel.step}</span>
        <input
          type="number"
          value={dt}
          step={0.001}
          min={0.001}
          max={0.05}
          onChange={(event) => onDtChange(Number(event.target.value))}
          className="w-full rounded border border-rule bg-graticule px-2 py-1 font-mono text-readout"
        />
      </label>

      <fieldset className="mb-4 space-y-2">
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

      <div className="mb-3 space-y-1 font-mono text-sm">
        <Legend color={RK4_COLOR} label={t.integratorNames.rk4} />
        <Legend color={RK2_COLOR} label={t.integratorNames.rk2} />
        <Legend color={EULER_COLOR} label={t.integratorNames.euler} />
      </div>

      <button
        type="button"
        onClick={onCheckConvergence}
        className="mb-3 w-full rounded border border-rule bg-graticule px-2 py-1.5 text-readout transition-colors duration-fast hover:bg-rule"
      >
        {t.panel.checkConvergence}
      </button>

      {convergence && (
        <div className="space-y-1 font-mono text-sm [font-variant-numeric:tabular-nums]">
          <div className="mb-1 text-caption">{t.panel.convergenceOrder}</div>
          <ConvergenceRow label={t.integratorNames.euler} expected={1} observed={convergence.euler} />
          <ConvergenceRow label={t.integratorNames.rk2} expected={2} observed={convergence.rk2} />
          <ConvergenceRow label={t.integratorNames.rk4} expected={4} observed={convergence.rk4} />
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { readonly color: string; readonly label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-2 w-4 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function ConvergenceRow({
  label,
  expected,
  observed,
}: {
  readonly label: string;
  readonly expected: number;
  readonly observed: number;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-caption">{label}</span>
      <span>
        {observed.toFixed(2)} <span className="text-caption">(≈{expected})</span>
      </span>
    </div>
  );
}
