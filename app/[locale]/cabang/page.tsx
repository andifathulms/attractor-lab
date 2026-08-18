import type { Metadata } from 'next';
import { dictionaries, type Locale } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { CabangView } from './CabangView';

export function generateMetadata({
  params,
}: {
  readonly params: { readonly locale: string };
}): Metadata {
  const locale: Locale = params.locale === 'en' ? 'en' : 'id';
  const t = dictionaries[locale];
  // description reuses the on-page bifurcation-diagram explanation
  // (CabangView.tsx), resolving its {axis} placeholder to the default 'z'.
  return buildMetadata({
    title: t.nav.cabang,
    description: t.panel.bifurcationExplain.replace('{axis}', 'z'),
    locale,
    path: '/cabang',
  });
}

export default function CabangPage() {
  return <CabangView />;
}
