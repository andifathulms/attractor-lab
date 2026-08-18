import type { Metadata } from 'next';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { IrisanView } from './IrisanView';

export function generateMetadata({
  params,
}: {
  readonly params: { readonly locale: string };
}): Metadata {
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];
  // description reuses the on-page Poincaré-section explanation
  // (components/section/SectionPlot.tsx).
  return buildMetadata({ title: t.nav.irisan, description: t.panel.sectionExplain, locale, path: '/irisan' });
}

export default function IrisanPage() {
  return <IrisanView />;
}
