import type { Metadata } from 'next';
import { Crimson_Pro, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

// Two families, not three: Crimson Pro serves both display and prose/UI
// text (font-sans is aliased to the same face in tailwind.config.ts), kept
// for its real italic — equations need proper italic variables (σ, ρ, β,
// ẋ), not a slanted roman. JetBrains Mono stays for numeric readouts.
// DESIGN.md §5.
const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
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
    <html lang="id" className={`${crimsonPro.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-night font-sans text-readout antialiased">{children}</body>
    </html>
  );
}
