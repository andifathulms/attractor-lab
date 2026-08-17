import { useT } from '@/lib/i18n/LocaleProvider';
import type { SystemId } from '@/lib/dynamics/systems';

const SYSTEM_LABEL: Record<SystemId, string> = {
  lorenz: 'Lorenz',
  rossler: 'Rössler',
  thomas: 'Thomas',
  halvorsen: 'Halvorsen',
  aizawa: 'Aizawa',
};

const AXIS_LABEL = ['x', 'y', 'z'] as const;

export type BifurcationPanelProps = {
  readonly systemId: SystemId;
  readonly onSystemChange: (id: SystemId) => void;
  readonly paramName: string;
  readonly onParamNameChange: (name: string) => void;
  readonly availableParams: readonly string[];
  readonly paramMin: number;
  readonly onParamMinChange: (value: number) => void;
  readonly paramMax: number;
  readonly onParamMaxChange: (value: number) => void;
  readonly sampleCount: number;
  readonly onSampleCountChange: (value: number) => void;
  readonly axis: 0 | 1 | 2;
  readonly onAxisChange: (axis: 0 | 1 | 2) => void;
  readonly dt: number;
  readonly onDtChange: (dt: number) => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
};

export function BifurcationPanel({
  systemId,
  onSystemChange,
  paramName,
  onParamNameChange,
  availableParams,
  paramMin,
  onParamMinChange,
  paramMax,
  onParamMaxChange,
  sampleCount,
  onSampleCountChange,
  axis,
  onAxisChange,
  dt,
  onDtChange,
  collapsed,
  onToggleCollapsed,
}: BifurcationPanelProps) {
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
        <span className="mb-1 block text-xs text-rule">{t.panel.sweptParameter}</span>
        <select
          value={paramName}
          onChange={(event) => onParamNameChange(event.target.value)}
          className="w-full rounded border border-rule bg-graticule px-2 py-1 text-readout"
        >
          {availableParams.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-4 flex gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-xs text-rule">{t.panel.min}</span>
          <input
            type="number"
            value={paramMin}
            onChange={(event) => onParamMinChange(Number(event.target.value))}
            className="w-full rounded border border-rule bg-graticule px-2 py-1 font-mono text-readout"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs text-rule">{t.panel.max}</span>
          <input
            type="number"
            value={paramMax}
            onChange={(event) => onParamMaxChange(Number(event.target.value))}
            className="w-full rounded border border-rule bg-graticule px-2 py-1 font-mono text-readout"
          />
        </label>
      </div>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs text-rule">{t.panel.sampleCount}</span>
        <input
          type="number"
          value={sampleCount}
          min={10}
          max={2000}
          onChange={(event) => onSampleCountChange(Number(event.target.value))}
          className="w-full rounded border border-rule bg-graticule px-2 py-1 font-mono text-readout"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs text-rule">{t.panel.localMaximaAxis}</span>
        <select
          value={axis}
          onChange={(event) => onAxisChange(Number(event.target.value) as 0 | 1 | 2)}
          className="w-full rounded border border-rule bg-graticule px-2 py-1 text-readout"
        >
          {AXIS_LABEL.map((label, i) => (
            <option key={label} value={i}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
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
    </div>
  );
}
