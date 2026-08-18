import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata';
import { systemReferences } from './[locale]/sistem/data';

// Same route names used by AppNav (lib/i18n/dictionaries.ts nav.*) and the
// same system slugs used by generateStaticParams in
// app/[locale]/sistem/[slug]/page.tsx — not a separately maintained list.
const ROUTES = ['jelajah', 'banding', 'cabang', 'irisan', 'sistem'] as const;
const LOCALES = ['id', 'en'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      entries.push({ url: `${SITE_URL}/${locale}/${route}` });
    }
    for (const reference of systemReferences) {
      entries.push({ url: `${SITE_URL}/${locale}/sistem/${reference.slug}` });
    }
  }
  return entries;
}
