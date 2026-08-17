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
  return (
    <div className="flex w-full flex-wrap items-center gap-6 border-t border-rule bg-night px-4 py-3 font-mono text-xs text-readout [font-variant-numeric:tabular-nums]">
      <Field label="integrator" value="RK4" />
      <Field label="langkah (dt)" value={dt.toExponential(1)} />
      <Field label="waktu sistem" value={elapsed.toFixed(2)} />
      <Field label="bidang" value={`${AXIS_LABEL[plane.axis]} = ${plane.offset}`} />
      <Field label="perpotongan" value={String(crossingCount)} />
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
