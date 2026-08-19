export type ReadoutField = {
  readonly label: string;
  readonly value: string;
};

export type ReadoutTag = {
  readonly label: string;
  readonly swatchClassName: string;
};

export type ReadoutStripProps = {
  readonly fields: readonly ReadoutField[];
  /** Trailing colour-swatch legend (e.g. trajectory A/B) — colour is never the only channel, so each tag carries its label too. DESIGN.md §8. */
  readonly tags?: readonly ReadoutTag[];
};

// The readout strip is never collapsible and never optional — an unlabelled
// attractor image is exactly what this project argues against. CLAUDE.md §4.
// One shell for every route (DESIGN-REWORK.md §2): which fields it shows is
// the only thing that differs.
export function ReadoutStrip({ fields, tags }: ReadoutStripProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-6 border-t border-rule bg-night px-4 py-3 font-mono text-sm text-readout [font-variant-numeric:tabular-nums]">
      {fields.map((field) => (
        <Field key={field.label} label={field.label} value={field.value} />
      ))}
      {tags && tags.length > 0 && (
        <span className="flex items-center gap-3">
          {tags.map((tag) => (
            <TrajectoryTag key={tag.label} swatchClassName={tag.swatchClassName} label={tag.label} />
          ))}
        </span>
      )}
    </div>
  );
}

function TrajectoryTag({ swatchClassName, label }: { readonly swatchClassName: string; readonly label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block h-2 w-2 rounded-full ${swatchClassName}`} />
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
