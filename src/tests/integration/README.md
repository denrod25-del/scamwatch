# Integration tests

These exercise real infrastructure (the Supabase Postgres DB), not mocks. They are
**separate from unit tests** and **auto-skip** when no local DB is configured, so
`npm test` and the fast CI checks never depend on them.

## Run locally

```bash
# 1. Start a local Supabase (applies supabase/migrations + seed.sql)
npm run db:start          # = supabase start

# 2. Point the tests at it. Either add these to .env.local …
#      SUPABASE_URL=<API URL from `supabase status`>
#      SUPABASE_SERVICE_ROLE_KEY=<service_role key from `supabase status`>
#    … (setup.ts loads .env.local automatically) or export them inline:
export SUPABASE_URL="$(supabase status -o env | sed -n 's/^API_URL=//p' | tr -d '\"')"
export SUPABASE_SERVICE_ROLE_KEY="$(supabase status -o env | sed -n 's/^SERVICE_ROLE_KEY=//p' | tr -d '\"')"

# 3. Run them
npm run test:integration
```

Without `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, the suite reports as skipped.

## What `search-db.test.ts` covers

- Seeds an entity → published report → threat (service-role, bypassing RLS).
- `fetchEntitySignal` returns the report count + related threat from the DB.
- `lookup()` derives **Confirmed Reported Scam** from real community signal (with the
  AI classifier stubbed so no OpenAI key is needed).
- `lookup()` returns **No Signal** for an entity with no reports.
- Cleans up its fixtures afterward (FK cascade from `reports`).

## CI

`.github/workflows/integration.yml` runs this on push/PR to `main`: it installs the
Supabase CLI, `supabase start` (applying migrations + seed), exports the env, and
runs `npm run test:integration`.
