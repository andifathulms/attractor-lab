import type { ReactNode } from 'react';
import { Footer } from '@/components/footer/Footer';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import type { Locale } from '@/lib/i18n/dictionaries';

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
  return (
    <LocaleProvider locale={locale}>
      {children}
      <Footer />
    </LocaleProvider>
  );
}
