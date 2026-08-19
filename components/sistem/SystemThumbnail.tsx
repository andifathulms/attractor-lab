import { MapPreview } from '@/components/maps/MapPreview';
import type { MapId } from '@/lib/dynamics/maps';
import { classicSystem, type SystemId } from '@/lib/dynamics/systems';
import { buildFlowThumbnail, THUMBNAIL_DT } from '@/lib/render/thumbnail';

export type SystemThumbnailProps = {
  readonly slug: string;
  readonly kind: 'flow' | 'map';
  readonly name: string;
  /** Translated integrator name (e.g. "RK4") — the thumbnail always integrates with RK4. */
  readonly integratorLabel: string;
};

// A small static render for /sistem's index — not live, not interactive,
// not animated (DESIGN-REWORK.md §3). Flows get a precomputed SVG path
// (buildFlowThumbnail runs at build time, since this page is statically
// exported) with their integrator and step size alongside it, since a
// thumbnail is still a render (CLAUDE.md invariant 4). Maps reuse
// MapPreview at a smaller size — no integration involved, so no step-size
// caption, matching the system reference page's own precedent.
export function SystemThumbnail({ slug, kind, name, integratorLabel }: SystemThumbnailProps) {
  if (kind === 'map') {
    return (
      <div className="aspect-square w-full bg-night">
        <MapPreview mapId={slug as MapId} name={name} />
      </div>
    );
  }

  const thumbnail = buildFlowThumbnail(classicSystem[slug as SystemId]);

  return (
    <div>
      <div className="aspect-square w-full bg-night">
        <svg viewBox={thumbnail.viewBox} className="h-full w-full" aria-hidden="true">
          <path d={thumbnail.d} fill="none" className="stroke-trail-a" strokeWidth="1" />
        </svg>
      </div>
      <p className="border-t border-rule px-3 py-1 font-mono text-xs text-caption [font-variant-numeric:tabular-nums]">
        {integratorLabel} · dt={THUMBNAIL_DT.toExponential(1)}
      </p>
    </div>
  );
}
