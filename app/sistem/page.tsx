import type { Metadata } from 'next';
import Link from 'next/link';
import { AppNav } from '@/components/nav/AppNav';
import { SystemThumbnail } from '@/components/sistem/SystemThumbnail';
import { dictionary } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { systemReferences } from './data';

// title/description both come from strings already rendered on this page
// (the <h1> and the brand tagline in AppNav) — never hand-duplicated.
export const metadata: Metadata = buildMetadata({
  title: dictionary.sistem.indexTitle,
  description: dictionary.brand.tagline,
  path: '/sistem',
});

export default function SistemIndexPage() {
  const t = dictionary;

  return (
    <main id="main-content" className="relative min-h-dvh bg-night px-6 py-16 text-readout">
      <AppNav />
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-display text-3xl font-medium">{t.sistem.indexTitle}</h1>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {systemReferences.map((s) => (
            <li key={s.slug} className="border border-rule">
              <Link href={`/sistem/${s.slug}`} className="group block">
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
                    {s.discoverer} · {s.year} · {s.kind === 'flow' ? t.sistem.flow : t.sistem.map}
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
