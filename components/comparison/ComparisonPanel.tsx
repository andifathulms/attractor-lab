import { PanelShell } from '@/components/panel/PanelShell';
import { useT } from '@/lib/i18n/LocaleProvider';
import type { ConvergenceOrders, ConvergenceResult } from '@/lib/dynamics/convergence';
import type { SystemId } from '@/lib/dynamics/systems';

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

  return (
    <PanelShell collapsed={collapsed} onToggleCollapsed={onToggleCollapsed}>
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
        <Legend swatchClassName="bg-trail-a" label={t.integratorNames.rk4} />
        <Legend swatchClassName="bg-section" label={t.integratorNames.rk2} />
        <Legend swatchClassName="bg-trail-b" label={t.integratorNames.euler} />
      </div>

      <button
        type="button"
        onClick={onCheckConvergence}
        className="mb-3 w-full rounded border border-rule bg-graticule px-2 py-1.5 text-readout transition-colors duration-fast hover:bg-rule"
      >
        {t.panel.checkConvergence}
      </button>

      {convergence && (
        <div className="space-y-2 font-mono text-sm [font-variant-numeric:tabular-nums]">
          <div className="mb-1 text-caption">{t.panel.convergenceOrder}</div>
          {/* The rule cited where it's applied, plus the two error
              magnitudes each order is actually computed from — not just
              the ratio's conclusion. */}
          <p className="text-caption">{t.panel.convergenceExplain}</p>
          <ConvergenceRow label={t.integratorNames.euler} expected={1} result={convergence.euler} />
          <ConvergenceRow label={t.integratorNames.rk2} expected={2} result={convergence.rk2} />
          <ConvergenceRow label={t.integratorNames.rk4} expected={4} result={convergence.rk4} />
        </div>
      )}
    </PanelShell>
  );
}

function Legend({ swatchClassName, label }: { readonly swatchClassName: string; readonly label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-2 w-4 rounded-full ${swatchClassName}`} />
      <span>{label}</span>
    </div>
  );
}

function ConvergenceRow({
  label,
  expected,
  result,
}: {
  readonly label: string;
  readonly expected: number;
  readonly result: ConvergenceResult;
}) {
  return (
    <div className="border-b border-rule pb-1">
      <div className="flex items-baseline justify-between">
        <span className="text-caption">{label}</span>
        <span>
          {result.order.toFixed(2)} <span className="text-caption">(≈{expected})</span>
        </span>
      </div>
      <div className="text-caption">
        error(dt)={result.errorCoarse.toExponential(2)} → error(dt/2)={result.errorFine.toExponential(2)}
      </div>
    </div>
  );
}
