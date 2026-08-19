import type { ReactNode } from 'react';
import { Footer } from '@/components/footer/Footer';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';

export function generateStaticParams(): { locale: string }[] {
  return [{ locale: 'id' }, { locale: 'en' }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  readonly children: ReactNode;
  readonly params: { readonly locale: string };
}) {
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];
  return (
    <LocaleProvider locale={locale}>
      {/* Every page's <main> carries id="main-content" — this is the one
          keyboard path to it, ahead of the nav links every page repeats. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-bloom focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-night"
      >
        {t.skipToContent}
      </a>
      {children}
      <Footer />
    </LocaleProvider>
  );
}
