import type { Metadata } from 'next';
import { dictionary } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { IrisanView } from './IrisanView';

// description reuses the on-page Poincaré-section explanation
// (components/section/SectionPlot.tsx).
export const metadata: Metadata = buildMetadata({
  title: dictionary.nav.irisan,
  description: dictionary.panel.sectionExplain,
  path: '/irisan',
});

export default function IrisanPage() {
  return <IrisanView />;
}
