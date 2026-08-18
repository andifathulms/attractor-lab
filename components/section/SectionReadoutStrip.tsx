import { useT } from '@/lib/i18n/LocaleProvider';
import type { Plane } from '@/lib/dynamics/section';

const AXIS_LABEL = ['x', 'y', 'z'] as const;

export type SectionReadoutStripProps = {
  readonly dt: number;
  readonly elapsed: number;
  readonly plane: Plane;
  readonly crossingCount: number;
};

// The readout strip is never collapsible and never optional — an unlabelled
// attractor image is exactly what this project argues against. CLAUDE.md §4.
export function SectionReadoutStrip({ dt, elapsed, plane, crossingCount }: SectionReadoutStripProps) {
  const t = useT();

  return (
    <div className="flex w-full flex-wrap items-center gap-6 border-t border-rule bg-night px-4 py-3 font-mono text-sm text-readout [font-variant-numeric:tabular-nums]">
      <Field label={t.readout.integrator} value={t.integratorNames.rk4} />
      <Field label={t.readout.step} value={dt.toExponential(1)} />
      <Field label={t.readout.elapsedTime} value={elapsed.toFixed(2)} />
      <Field label={t.readout.plane} value={`${AXIS_LABEL[plane.axis]} = ${plane.offset}`} />
      <Field label={t.readout.crossings} value={String(crossingCount)} />
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
