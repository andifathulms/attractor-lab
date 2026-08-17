import Link from 'next/link';

const LINKS = [
  { href: '/id/jelajah', label: 'Jelajah' },
  { href: '/id/banding', label: 'Banding' },
  { href: '/id/irisan', label: 'Irisan' },
  { href: '/id/cabang', label: 'Cabang' },
  { href: '/id/sistem', label: 'Sistem' },
] as const;

// Small and out of the way — this is an instrument with controls, not a
// site with a navbar. DESIGN.md §6.
export function AppNav() {
  return (
    <nav className="absolute left-4 top-4 z-10 flex gap-3 font-mono text-xs text-rule">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="transition-colors duration-fast hover:text-readout">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
