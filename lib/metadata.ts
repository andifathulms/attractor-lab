import type { Metadata } from 'next';
import type { Locale } from './i18n/dictionaries';

// GitHub Pages project-site URL: matches next.config.mjs's basePath
// (`/${repoName}`) and the GitHub username already used for the maker's
// mark (components/footer/MakerSignature.tsx).
export const SITE_URL = 'https://andifathulms.github.io/attractor-lab';

// The brand kit's 1200x630 social card (public/og.png) — one image for
// every route. output:'export' can't run dynamic per-route OG image
// generation, and a hand-authored one is enough to fill the previously
// completely empty preview.
const OG_IMAGE = { url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: 'Attractor Lab' };

/**
 * Builds one route's full Metadata object — title, description, canonical,
 * hreflang alternates, Open Graph, and Twitter Card — from strings the
 * caller already has (never invented here), so a description can't drift
 * from what the page actually says.
 */
export function buildMetadata({
  title,
  description,
  locale,
  path,
  suffixTitle = true,
}: {
  readonly title: string;
  readonly description: string;
  readonly locale: Locale;
  readonly path: string;
  /** Set false when `title` is already the full site title (the root route) — avoids "Attractor Lab — Attractor Lab". */
  readonly suffixTitle?: boolean;
}): Metadata {
  const fullTitle = suffixTitle ? `${title} — Attractor Lab` : title;
  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title: fullTitle,
    description,
    // Absolute URL, not Next's special app/manifest.ts route: that file's
    // auto-injected <link> doesn't get the /attractor-lab basePath prefix
    // in this Next version, which would 404 on the deployed site. A plain
    // static file (public/manifest.webmanifest) referenced explicitly here
    // sidesteps the bug.
    manifest: `${SITE_URL}/manifest.webmanifest`,
    alternates: {
      canonical: url,
      languages: {
        id: `${SITE_URL}/id${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Attractor Lab',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      type: 'website',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
