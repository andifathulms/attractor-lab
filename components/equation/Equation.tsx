import type { ReactNode } from 'react';

export type EquationProps = {
  /** Hand-set SVG content — <tspan> runs, sub/superscripts via baseline-shift. */
  readonly children: ReactNode;
  /** Plain-text equivalent for the accessible tree — never an image, never KaTeX. CLAUDE.md invariant 11. */
  readonly plain: string;
};

/**
 * One equation, hand-set as inline SVG text so variables get real italics
 * (Crimson Pro) instead of a slanted roman, with `plain` as its accessible
 * name. DESIGN.md §5.
 */
export function Equation({ children, plain }: EquationProps) {
  // A monospace-ish character-count estimate — hand-set text has no layout
  // pass to measure against ahead of paint, and this only sizes the
  // viewBox (how much of it the glyphs actually use is fine to leave
  // slack in), not the glyphs themselves.
  const width = Math.max(120, plain.length * 11 + 24);

  return (
    <svg
      role="img"
      aria-label={plain}
      viewBox={`0 0 ${width} 32`}
      className="h-8 w-auto max-w-full"
    >
      <title>{plain}</title>
      <text x="0" y="22" className="fill-readout font-display text-[22px] italic">
        {children}
      </text>
    </svg>
  );
}

export type SubProps = { readonly children: ReactNode };

/** A subscript run, e.g. the "1" in x₁. */
export function Sub({ children }: SubProps) {
  return (
    <tspan baselineShift="sub" fontSize="0.7em">
      {children}
    </tspan>
  );
}

/** A superscript run, e.g. the "3" in z³. */
export function Sup({ children }: SubProps) {
  return (
    <tspan baselineShift="super" fontSize="0.7em">
      {children}
    </tspan>
  );
}

/** An upright (non-italic) run — operators, digits, punctuation. */
export function Up({ children }: SubProps) {
  return <tspan className="not-italic">{children}</tspan>;
}
