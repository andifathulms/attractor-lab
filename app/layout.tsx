import type { Metadata } from 'next';
import { Crimson_Pro, DM_Sans, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { dictionaries } from '@/lib/i18n/dictionaries';
import { buildMetadata } from '@/lib/metadata';
import './globals.css';

// JUDGEMENT CALL (revertible in one line, see tailwind.config.ts): back to
// three families. The two-family pass put Crimson Pro — a text serif kept
// for its real italic in equation variables — into every dense form
// control (selects, checkboxes, tiny numeric inputs) as well. Restoring
// DM Sans for UI/prose here and re-pointing font-sans at --font-sans in
// tailwind.config.ts is the one-line revert back to two families.
// Tried constraining these to explicit weight/style arrays (the app only
// ever uses 400/500 + italic on the first two, per every className in
// components/ and app/) — measured result was WORSE: requesting discrete
// weight+style combinations made next/font emit separate static instances
// per combination instead of one compact variable-range file, growing the
// preloaded set for jelajah from 125,612 to 197,524 bytes. Reverted.
// PERFORMANCE_AND_DISCOVERABILITY audit — see conversation for the numbers.
const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Baseline for the bare root URL (redirects to /id/jelajah) — every other
// route overrides this with its own generateMetadata. Reuses the same
// brand tagline shown in AppNav on every page, not separately authored copy.
export const metadata: Metadata = buildMetadata({
  title: 'Attractor Lab',
  description: dictionaries.id.brand.tagline,
  locale: 'id',
  path: '',
  suffixTitle: false,
});

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="id" className={`${crimsonPro.variable} ${dmSans.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-night font-sans text-readout antialiased">{children}</body>
    </html>
  );
}
