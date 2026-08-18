import type { Metadata } from 'next';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { JelajahView } from './JelajahView';

export function generateMetadata({
  params,
}: {
  readonly params: { readonly locale: string };
}): Metadata {
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];
  // title/description both come from strings already rendered on this page
  // (the current nav link and the brand tagline in AppNav).
  return buildMetadata({ title: t.nav.jelajah, description: t.brand.tagline, locale, path: '/jelajah' });
}

export default function JelajahPage() {
  return <JelajahView />;
}
