import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppNav } from '@/components/nav/AppNav';
import { Equation } from '@/components/equation/Equation';
import { MapPreview } from '@/components/maps/MapPreview';
import { VerifiedConstants } from '@/components/sistem/VerifiedConstants';
import type { MapId } from '@/lib/dynamics/maps';
import type { SystemId } from '@/lib/dynamics/systems';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { getSystemReference, pick, systemReferences } from '../data';

export function generateStaticParams(): { slug: string }[] {
  return systemReferences.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({
  params,
}: {
  readonly params: { readonly locale: string; readonly slug: string };
}): Metadata {
  const reference = getSystemReference(params.slug);
  if (!reference) return {};
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  // title/description both come from the reference entry that renders this
  // exact page (data.tsx) — the same "distinctiveness" paragraph shown
  // on-page, not separately authored copy.
  return buildMetadata({
    title: reference.name,
    description: pick(reference.distinctiveness, locale),
    locale,
    path: `/sistem/${reference.slug}`,
  });
}

export default function SistemSlugPage({
  params,
}: {
  readonly params: { readonly locale: string; readonly slug: string };
}) {
  const reference = getSystemReference(params.slug);
  if (!reference) notFound();

  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];

  return (
    <main id="main-content" className="relative min-h-dvh bg-night px-6 py-16 text-readout">
      <AppNav />
      <article className="mx-auto max-w-2xl">
        <h1 className="mb-1 font-display text-3xl font-medium">{reference.name}</h1>
        <p className="mb-8 font-mono text-sm text-caption">
          {pick(reference.discoverer, locale)} · {reference.year}
        </p>

        <section className="mb-10 space-y-3">
          {reference.equations.map((eq) => (
            <Equation key={eq.plain} plain={eq.plain}>
              {eq.node}
            </Equation>
          ))}
        </section>

        {reference.kind === 'map' && (
          <section className="mb-10 h-64 w-64 border border-rule">
            <MapPreview mapId={reference.slug as MapId} name={reference.name} />
          </section>
        )}

        <section className="mb-10">
          <h2 className="mb-3 font-display text-lg font-medium">{t.sistem.parameters}</h2>
          <table className="w-full border-collapse font-mono text-sm">
            <tbody>
              {reference.params.map((p) => (
                <tr key={p.symbol} className="border-b border-rule">
                  <td className="py-2 pr-4 font-display italic">{p.symbol}</td>
                  <td className="py-2 pr-4 font-sans text-readout">{pick(p.meaning, locale)}</td>
                  <td className="py-2 text-right [font-variant-numeric:tabular-nums]">
                    {p.classicValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {reference.kind === 'flow' && <VerifiedConstants systemId={reference.slug as SystemId} />}

        <section className="mb-10">
          <h2 className="mb-3 font-display text-lg font-medium">{t.sistem.distinctiveness}</h2>
          <p className="font-display text-base leading-relaxed">{pick(reference.distinctiveness, locale)}</p>
        </section>

        <p className="font-mono text-sm text-caption">{pick(reference.citation, locale)}</p>
      </article>
    </main>
  );
}
