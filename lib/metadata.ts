import type { Metadata } from 'next';
import type { Locale } from './i18n/dictionaries';

// GitHub Pages project-site URL: matches next.config.mjs's basePath
// (`/${repoName}`) and the GitHub username already used for the maker's
// mark (components/footer/MakerSignature.tsx).
export const SITE_URL = 'https://andifathulms.github.io/attractor-lab';

/**
 * Builds one route's full Metadata object — title, description, canonical,
 * hreflang alternates, Open Graph, and Twitter Card — from strings the
 * caller already has (never invented here), so a description can't drift
 * from what the page actually says. No OG image: output:'export' can't run
 * dynamic image generation, and there's no static image asset in this
 * project to reference instead — flagged as a known gap, not silently
 * skipped.
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
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
    },
  };
}
