// The brand kit's "Kupu" mark (exports/svg/favicon.svg), stripped of its
// tile background for in-page use and recolored to the app's own tokens
// (trail-a/trail-b/readout) instead of the kit's separate near-identical
// hex values, so the dots exactly match the trajectory A/B legend colors
// used everywhere else (e.g. ReadoutStrip's TrajectoryTag).
export function BrandMark() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-7 w-7 shrink-0">
      <circle cx="35" cy="58" r="24" fill="none" className="stroke-readout" strokeWidth="4.5" />
      <circle cx="63" cy="42" r="24" fill="none" className="stroke-readout" strokeWidth="4.5" />
      <path d="M49 50 Q 34 46, 22 40" fill="none" className="stroke-trail-a" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M51 50 Q 66 55, 78 63" fill="none" className="stroke-trail-b" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="49" cy="50" r="4" className="fill-trail-a" />
      <circle cx="51" cy="50" r="4" className="fill-trail-b" />
    </svg>
  );
}
