import Link from 'next/link';
import { AppNav } from '@/components/nav/AppNav';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';
import { pick, systemReferences } from './data';

export default function SistemIndexPage({
  params,
}: {
  readonly params: { readonly locale: string };
}) {
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];

  return (
    <main className="relative min-h-dvh bg-night px-6 py-16 text-readout">
      <AppNav />
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 font-display text-3xl font-medium">{t.sistem.indexTitle}</h1>
        <ul className="space-y-4">
          {systemReferences.map((s) => (
            <li key={s.slug} className="border-b border-rule pb-4">
              <Link
                href={`/${locale}/sistem/${s.slug}`}
                className="font-display text-xl italic transition-colors duration-fast hover:text-bloom"
              >
                {s.name}
              </Link>
              <p className="mt-1 font-mono text-xs text-caption">
                {pick(s.discoverer, locale)} · {s.year} · {s.kind === 'flow' ? t.sistem.flow : t.sistem.map}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
