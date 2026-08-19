import type { Metadata } from 'next';
import Link from 'next/link';
import { AppNav } from '@/components/nav/AppNav';
import { SystemThumbnail } from '@/components/sistem/SystemThumbnail';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { pick, systemReferences } from './data';

export function generateMetadata({
  params,
}: {
  readonly params: { readonly locale: string };
}): Metadata {
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];
  // title/description both come from strings already rendered on this page
  // (the <h1> and the brand tagline in AppNav) — never hand-duplicated.
  return buildMetadata({ title: t.sistem.indexTitle, description: t.brand.tagline, locale, path: '/sistem' });
}

export default function SistemIndexPage({
  params,
}: {
  readonly params: { readonly locale: string };
}) {
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];

  return (
    <main id="main-content" className="relative min-h-dvh bg-night px-6 py-16 text-readout">
      <AppNav />
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-display text-3xl font-medium">{t.sistem.indexTitle}</h1>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {systemReferences.map((s) => (
            <li key={s.slug} className="border border-rule">
              <Link href={`/${locale}/sistem/${s.slug}`} className="group block">
                <SystemThumbnail
                  slug={s.slug}
                  kind={s.kind}
                  name={s.name}
                  integratorLabel={t.integratorNames.rk4}
                />
                <div className="border-t border-rule p-3">
                  <span className="font-display text-lg italic text-readout transition-colors duration-fast group-hover:text-bloom">
                    {s.name}
                  </span>
                  <p className="mt-1 font-mono text-xs text-caption">
                    {pick(s.discoverer, locale)} · {s.year} · {s.kind === 'flow' ? t.sistem.flow : t.sistem.map}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
