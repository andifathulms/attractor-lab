import type { Metadata } from 'next';
import { dictionary } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import { JelajahView } from './JelajahView';

// title/description both come from strings already rendered on this page
// (the current nav link and the brand tagline in AppNav).
export const metadata: Metadata = buildMetadata({
  title: dictionary.nav.jelajah,
  description: dictionary.brand.tagline,
  path: '/jelajah',
});

export default function JelajahPage() {
  return <JelajahView />;
}
