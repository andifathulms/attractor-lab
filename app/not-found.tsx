import Link from 'next/link';
import { dictionary } from '@/lib/i18n/dictionaries';

// Static export needs this file to produce a real out/404.html rather than
// falling back to Next's bare default.
export const metadata = { title: '404: Attractor Lab' };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-night px-6 py-16 text-center text-readout">
      <div>
        <p className="font-display text-3xl font-medium text-bloom">{dictionary.notFound.title}</p>
        <p className="mt-2 max-w-md font-sans text-base text-caption">{dictionary.notFound.description}</p>
        <Link
          href="/jelajah"
          className="mt-4 inline-block font-mono text-sm text-readout underline decoration-trail-a decoration-2 underline-offset-4 transition-colors duration-fast hover:text-bloom"
        >
          {dictionary.notFound.backLink}
        </Link>
      </div>
    </main>
  );
}
