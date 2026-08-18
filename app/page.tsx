import Link from 'next/link';
import { RootRedirect } from './RootRedirect';

// The redirect itself is client-only (needs useRouter) — this stays a
// Server Component so it can inherit the root layout's real metadata
// (title/description/OG/canonical) and offer a real link for crawlers or
// visitors without JS, instead of an empty page with a script tag. Link
// (not a plain <a>) so the href picks up basePath correctly.
export default function RootPage() {
  return (
    <>
      <RootRedirect />
      <noscript>
        <Link href="/id/jelajah">Attractor Lab</Link>
      </noscript>
    </>
  );
}
