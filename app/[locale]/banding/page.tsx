import type { Metadata } from 'next';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { BandingView } from './BandingView';

export function generateMetadata({
  params,
}: {
  readonly params: { readonly locale: string };
}): Metadata {
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];
  // description reuses the convergence-check explanation this page already
  // renders (components/comparison/ComparisonPanel.tsx) rather than
  // separately authored copy.
  return buildMetadata({
    title: t.nav.banding,
    description: t.panel.convergenceExplain,
    locale,
    path: '/banding',
  });
}

export default function BandingPage() {
  return <BandingView />;
}
