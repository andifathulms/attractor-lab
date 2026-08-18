import { useT } from '@/lib/i18n/LocaleProvider';
import type { IntegratorId } from '@/lib/dynamics/integrate';

export type ReadoutStripProps = {
  readonly integrator: IntegratorId;
  readonly dt: number;
  readonly elapsed: number;
  readonly lyapunovMax: number | undefined;
  readonly pairMode?: boolean;
  readonly epsilon?: number;
};

// The readout strip is never collapsible and never optional — an unlabelled
// attractor image is exactly what this project argues against. CLAUDE.md §4.
export function ReadoutStrip({
  integrator,
  dt,
  elapsed,
  lyapunovMax,
  pairMode,
  epsilon,
}: ReadoutStripProps) {
  const t = useT();

  return (
    <div className="flex w-full flex-wrap items-center gap-6 border-t border-rule bg-night px-4 py-3 font-mono text-sm text-readout [font-variant-numeric:tabular-nums]">
      <Field label={t.readout.integrator} value={t.integratorNames[integrator]} />
      <Field label={t.readout.step} value={dt.toExponential(1)} />
      <Field label={t.readout.elapsedTime} value={elapsed.toFixed(2)} />
      <Field
        label={t.readout.lyapunovMax}
        value={lyapunovMax !== undefined ? lyapunovMax.toFixed(4) : '—'}
      />
      {pairMode && epsilon !== undefined && (
        <>
          <Field label={t.readout.epsilon} value={epsilon.toExponential(1)} />
          <span className="flex items-center gap-3">
            <TrajectoryTag color="#F0C05A" label="A" />
            <TrajectoryTag color="#5FB0D9" label="B" />
          </span>
        </>
      )}
    </div>
  );
}

function TrajectoryTag({ color, label }: { readonly color: string; readonly label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-caption">{label}</span>
      <span>{value}</span>
    </div>
  );
}
