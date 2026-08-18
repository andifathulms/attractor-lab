'use client';

import Link from 'next/link';
import { useLocale, useT } from '@/lib/i18n/LocaleProvider';

// Small and out of the way — this is an instrument with controls, not a
// site with a navbar. DESIGN.md §6.
export function AppNav() {
  const locale = useLocale();
  const t = useT();

  const links = [
    { href: `/${locale}/jelajah`, label: t.nav.jelajah },
    { href: `/${locale}/banding`, label: t.nav.banding },
    { href: `/${locale}/irisan`, label: t.nav.irisan },
    { href: `/${locale}/cabang`, label: t.nav.cabang },
    { href: `/${locale}/sistem`, label: t.nav.sistem },
  ];

  return (
    <nav className="absolute left-4 top-4 z-10 flex gap-3 font-mono text-sm text-caption">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="transition-colors duration-fast hover:text-readout">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
