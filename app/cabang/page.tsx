import type { Metadata } from 'next';
import { dictionary } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { CabangView } from './CabangView';

// description reuses the on-page bifurcation-diagram explanation
// (CabangView.tsx), resolving its {axis} placeholder to the default 'z'.
export const metadata: Metadata = buildMetadata({
  title: dictionary.nav.cabang,
  description: dictionary.panel.bifurcationExplain.replace('{axis}', 'z'),
  path: '/cabang',
});

export default function CabangPage() {
  return <CabangView />;
}
