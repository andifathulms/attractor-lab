import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata';
import { systemReferences } from './sistem/data';

// Same route names used by AppNav (lib/i18n/dictionaries.ts nav.*) and the
// same system slugs used by generateStaticParams in
// app/sistem/[slug]/page.tsx — not a separately maintained list.
const ROUTES = ['jelajah', 'banding', 'cabang', 'irisan', 'sistem'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const route of ROUTES) {
    entries.push({ url: `${SITE_URL}/${route}` });
  }
  for (const reference of systemReferences) {
    entries.push({ url: `${SITE_URL}/sistem/${reference.slug}` });
  }
  return entries;
}
