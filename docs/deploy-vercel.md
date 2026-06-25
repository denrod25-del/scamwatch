# Deploying ScamWatch to Vercel

ScamWatch is a standard Next.js app and deploys to Vercel two ways. **Path A (Git integration) is recommended** — it needs no secrets in GitHub and gives you preview deploys per PR automatically.

## Path A — Vercel Git integration (recommended)

1. Go to <https://vercel.com/new> and **Import** `denrod25-del/scamwatch`.
2. Framework preset: **Next.js** (auto-detected). Build/Output settings: defaults.
3. Add **Environment Variables** (Project → Settings → Environment Variables) for Production (and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `OPENAI_API_KEY` (server-only)
   - `OPENAI_MODEL_CLASSIFIER`, `OPENAI_MODEL_EXPLAINER`, `OPENAI_EMBEDDING_MODEL` (optional overrides)
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
4. Deploy. Every push to `main` ships to production; every PR gets a preview URL.

`vercel.json` in the repo pins the framework and enables production deploys from `main`.

> The app degrades gracefully without keys (search returns "No Signal", the classifier abstains), so a first deploy will boot even before Supabase/OpenAI are configured — but it won't return real results until they are.

## Path B — Deploy via GitHub Actions (`.github/workflows/deploy.yml`)

Use this if you'd rather drive deploys from CI than from Vercel's Git integration. The workflow is **opt-in and skipped by default** so it never fails your commit status until configured.

1. Locally: `npm i -g vercel && vercel link` → creates `.vercel/project.json` containing `orgId` and `projectId`.
2. In **GitHub → Settings → Secrets and variables → Actions**, add:
   - **Secrets:** `VERCEL_TOKEN` (Vercel → Account → Tokens), `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - **Variable:** `VERCEL_ENABLED` = `true` ← this flips the job on
3. Push to `main` (or run the **Deploy** workflow manually). The job pulls the Vercel env, builds with `vercel build --prod`, and deploys the prebuilt output.

> Don't enable **both** paths for production, or each push deploys twice. Pick one. (A common split: Path A for previews, Path B disabled — or vice-versa.)

## Required runtime environment

See `.env.example` for the full list. Secrets management and rotation are covered in PRD **Vol 14 (Security)** and **Vol 13 (Backend)**.
