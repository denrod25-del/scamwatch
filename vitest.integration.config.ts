import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Integration tests (Vol 15) — exercise the real Supabase DB path against a LOCAL
 * Supabase instance. Run separately from unit tests: `npm run test:integration`.
 * Tests auto-skip when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set, so
 * this never blocks contributors without a running DB.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./tests/integration/setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Serial: tests share one DB and insert/clean fixtures.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
