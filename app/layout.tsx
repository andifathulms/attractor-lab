import type { Metadata } from 'next';
import { Crimson_Pro, DM_Sans, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

// JUDGEMENT CALL (revertible in one line, see tailwind.config.ts): back to
// three families. The two-family pass put Crimson Pro — a text serif kept
// for its real italic in equation variables — into every dense form
// control (selects, checkboxes, tiny numeric inputs) as well. Restoring
// DM Sans for UI/prose here and re-pointing font-sans at --font-sans in
// tailwind.config.ts is the one-line revert back to two families.
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

export const metadata: Metadata = {
  title: 'Attractor Lab',
  description:
    'Jelajahi atraktor aneh — integrator tulisan tangan, sepasang lintasan yang menyimpang, dan ekspor plotter.',
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="id" className={`${crimsonPro.variable} ${dmSans.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-night font-sans text-readout antialiased">{children}</body>
    </html>
  );
}
