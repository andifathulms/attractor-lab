import { useT } from '@/lib/i18n/LocaleProvider';
import type { Plane } from '@/lib/dynamics/section';
import type { SystemId } from '@/lib/dynamics/systems';

const SYSTEM_LABEL: Record<SystemId, string> = {
  lorenz: 'Lorenz',
  rossler: 'Rössler',
  thomas: 'Thomas',
  halvorsen: 'Halvorsen',
  aizawa: 'Aizawa',
};

const AXIS_LABEL = ['x', 'y', 'z'] as const;

export type SectionPanelProps = {
  readonly systemId: SystemId;
  readonly onSystemChange: (id: SystemId) => void;
  readonly params: Record<string, number>;
  readonly onParamsChange: (params: Record<string, number>) => void;
  readonly dt: number;
  readonly onDtChange: (dt: number) => void;
  readonly plane: Plane;
  readonly onPlaneChange: (plane: Plane) => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
};

export function SectionPanel({
  systemId,
  onSystemChange,
  params,
  onParamsChange,
  dt,
  onDtChange,
  plane,
  onPlaneChange,
  collapsed,
  onToggleCollapsed,
}: SectionPanelProps) {
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
        <span className="mb-1 block text-xs text-rule">{t.panel.system}</span>
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
        <span className="mb-1 block text-xs text-rule">{t.panel.step}</span>
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

      <div className="mb-4 rounded border border-rule p-2">
        <span className="mb-2 block text-xs text-rule">{t.panel.plane}</span>
        <label className="mb-2 block">
          <span className="mb-1 block text-xs text-rule">{t.panel.axis}</span>
          <select
            value={plane.axis}
            onChange={(event) =>
              onPlaneChange({ ...plane, axis: Number(event.target.value) as 0 | 1 | 2 })
            }
            className="w-full rounded border border-rule bg-graticule px-2 py-1 text-readout"
          >
            {AXIS_LABEL.map((label, axis) => (
              <option key={label} value={axis}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-rule">{t.panel.offset}</span>
          <input
            type="number"
            value={plane.offset}
            step={0.5}
            onChange={(event) => onPlaneChange({ ...plane, offset: Number(event.target.value) })}
            className="w-full rounded border border-rule bg-graticule px-2 py-1 font-mono text-readout"
          />
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-xs text-rule">{t.panel.parameters}</legend>
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
    </div>
  );
}
