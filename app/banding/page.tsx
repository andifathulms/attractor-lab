import type { Metadata } from 'next';
import { dictionary } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { BandingView } from './BandingView';

// description reuses the convergence-check explanation this page already
// renders (components/comparison/ComparisonPanel.tsx) rather than
// separately authored copy.
export const metadata: Metadata = buildMetadata({
  title: dictionary.nav.banding,
  description: dictionary.panel.convergenceExplain,
  path: '/banding',
});

export default function BandingPage() {
  return <BandingView />;
}
