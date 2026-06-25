import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin file-tracing to this project (a lockfile exists higher up the tree).
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  // Typed routes aid the Vol 12 route map (top-level since Next 15.1).
  typedRoutes: true,
  // Security headers — baseline; full CSP is owned by Vol 14 (SEC-14) and tightened in middleware.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  images: {
    // Scam-evidence screenshots are served via Supabase Storage signed URLs (Vol 13).
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
};

export default nextConfig;
