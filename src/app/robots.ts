import type { MetadataRoute } from 'next';

const base = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/moderation', '/account', '/api/', '/alerts/settings'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
