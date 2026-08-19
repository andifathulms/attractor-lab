'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useT } from '@/lib/i18n/LocaleProvider';
import { BrandMark } from './BrandMark';

// Small and out of the way — this is an instrument with controls, not a
// site with a navbar. DESIGN.md §6. The brand line is the one deliberately
// larger text on screen: a first-time visitor's anchor for what this is,
// before anything else competes for attention.
export function AppNav() {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();

  const links = [
    { href: `/${locale}/jelajah`, label: t.nav.jelajah },
    { href: `/${locale}/banding`, label: t.nav.banding },
    { href: `/${locale}/irisan`, label: t.nav.irisan },
    { href: `/${locale}/cabang`, label: t.nav.cabang },
    { href: `/${locale}/sistem`, label: t.nav.sistem },
  ];

  return (
    <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100vw-2rem)] flex-col gap-2">
      <Link href={`/${locale}/jelajah`} className="flex items-start gap-2">
        <BrandMark />
        <div>
          <p className="font-display text-lg font-medium leading-tight text-bloom">{t.brand.name}</p>
          <p className="max-w-xs font-sans text-sm leading-snug text-caption">{t.brand.tagline}</p>
        </div>
      </Link>
      <nav className="flex flex-wrap gap-3 font-mono text-sm text-caption">
        {links.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'text-readout underline decoration-trail-a decoration-2 underline-offset-4'
                  : 'transition-colors duration-fast hover:text-readout'
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
