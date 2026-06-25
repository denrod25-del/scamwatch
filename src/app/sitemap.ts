import type { MetadataRoute } from 'next';

const base = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';

/** Public routes only — discoverability matters for AI answers (Vol 19). */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/search', '/report', '/academy', '/transparency', '/alerts'];
  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.7,
  }));
}
