export type ComparisonReadoutStripProps = {
  readonly dt: number;
  readonly elapsed: number;
  readonly eulerVsRk4: number | undefined;
  readonly rk2VsRk4: number | undefined;
};

// The readout strip is never collapsible and never optional — an unlabelled
// attractor image is exactly what this project argues against. CLAUDE.md §4.
export function ComparisonReadoutStrip({
  dt,
  elapsed,
  eulerVsRk4,
  rk2VsRk4,
}: ComparisonReadoutStripProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-6 border-t border-rule bg-night px-4 py-3 font-mono text-xs text-readout [font-variant-numeric:tabular-nums]">
      <Field label="langkah (dt)" value={dt.toExponential(1)} />
      <Field label="waktu sistem" value={elapsed.toFixed(2)} />
      <Field
        label="|euler − rk4|"
        value={eulerVsRk4 !== undefined ? eulerVsRk4.toExponential(2) : '—'}
      />
      <Field
        label="|rk2 − rk4|"
        value={rk2VsRk4 !== undefined ? rk2VsRk4.toExponential(2) : '—'}
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
