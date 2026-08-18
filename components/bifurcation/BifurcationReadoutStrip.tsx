import { useT } from '@/lib/i18n/LocaleProvider';

export type BifurcationReadoutStripProps = {
  readonly dt: number;
  readonly paramName: string;
  readonly paramMin: number;
  readonly paramMax: number;
  readonly sampleIndex: number;
  readonly sampleCount: number;
  readonly done: boolean;
};

// The readout strip is never collapsible and never optional — an unlabelled
// attractor image is exactly what this project argues against. CLAUDE.md §4.
export function BifurcationReadoutStrip({
  dt,
  paramName,
  paramMin,
  paramMax,
  sampleIndex,
  sampleCount,
  done,
}: BifurcationReadoutStripProps) {
  const t = useT();

  return (
    <div className="flex w-full flex-wrap items-center gap-6 border-t border-rule bg-night px-4 py-3 font-mono text-sm text-readout [font-variant-numeric:tabular-nums]">
      <Field label={t.readout.integrator} value={t.integratorNames.rk4} />
      <Field label={t.readout.step} value={dt.toExponential(1)} />
      <Field label={t.readout.sweep} value={`${paramName} ∈ [${paramMin}, ${paramMax}]`} />
      <Field
        label={t.readout.progress}
        value={done ? `${sampleCount}/${sampleCount} ${t.readout.done}` : `${sampleIndex}/${sampleCount}`}
      />
    </div>
  );
}

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-rule">{label}</span>
      <span>{value}</span>
    </div>
  );
}
