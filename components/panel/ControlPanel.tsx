import { useT } from '@/lib/i18n/LocaleProvider';
import type { IntegratorId } from '@/lib/dynamics/integrate';
import type { SystemId } from '@/lib/dynamics/systems';

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
}: ControlPanelProps) {
  const t = useT();

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={t.panel.openPanel}
        className="absolute right-0 top-8 rounded-l border border-r-0 border-rule bg-night/90 px-2 py-4 font-sans text-sm text-readout transition-colors duration-fast hover:bg-graticule"
      >
        ⟨
      </button>
    );
  }

  return (
    <div className="absolute right-4 top-8 w-72 rounded border border-rule bg-night/90 p-4 font-sans text-sm text-readout backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">{t.panel.title}</h2>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={t.panel.closePanel}
          className="text-readout transition-colors duration-fast hover:text-bloom"
        >
          ⟩
        </button>
      </div>

      <label className="mb-4 block">
        <span className="mb-1 block text-sm text-rule">{t.panel.system}</span>
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
        <span className="mb-1 block text-sm text-rule">{t.panel.integrator}</span>
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
        <span className="mb-1 block text-sm text-rule">{t.panel.step}</span>
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

      <label className="mb-4 flex items-center justify-between">
        <span className="text-sm text-rule">{t.panel.pairMode}</span>
        <input
          type="checkbox"
          checked={pairMode}
          onChange={(event) => onPairModeChange(event.target.checked)}
          className="h-4 w-4 accent-trail-a"
        />
      </label>

      {pairMode && (
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-rule">{t.panel.epsilon}</span>
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
        <legend className="mb-1 text-sm text-rule">{t.panel.parameters}</legend>
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
        className="mt-4 w-full rounded border border-rule bg-graticule px-2 py-1.5 text-readout transition-colors duration-fast hover:bg-rule"
      >
        {t.panel.exportSvg}
      </button>
    </div>
  );
}
