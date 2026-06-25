# Contributing to ScamWatch

Thank you for helping build consumer protection infrastructure. ScamWatch exists to prevent real-world harm, so the contribution bar is correctness, safety, and respect for the people who use it.

## Ground rules

- **Trauma-aware copy.** User-facing text must never blame or shame victims, never exaggerate, and must route people to official organizations. ScamWatch is consumer protection, **not legal advice**.
- **Calibrated AI.** Never present model output as fact. Every verdict carries confidence and a "verify with official sources" path. Classifiers may abstain.
- **Privacy by default.** Minimize what you collect. De-identify content before it reaches any third-party AI. Never log PII.
- **Accessibility is a contract.** WCAG 2.2 AA is required, not aspirational.

## Development setup

```bash
nvm use                  # Node version from .nvmrc (>= 22)
npm install
cp .env.example .env.local   # fill in Supabase + OpenAI keys
npm run db:start && npm run db:reset
npm run db:types
npm run dev
```

## Branch & PR workflow

1. Branch from `main`: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
2. Reference the PRD requirement ID(s) you implement in the PR description (e.g. `FR-5.1.3`, `SEC-14.8.2`). The spec lives in [`docs/prd/`](docs/prd/README.md).
3. Keep PRs focused. Add tests for behavior you add or change.
4. Fill in the PR template checklist (a11y, security, copy tone, tests, screenshots).

## Quality gates (must pass before merge — PRD Vol 15)

```bash
npm run lint
npm run typecheck
npm run format:check
npm test            # Vitest unit + component
npm run test:e2e    # Playwright (critical journeys)
npm run build
```

Accessibility and security checks are merge-blocking. Do not silence a failing a11y or security test to get green — fix the underlying issue.

## Commits & sign-off

- Conventional Commits style (`feat:`, `fix:`, `docs:`…).
- Sign off your commits (DCO): `git commit -s`.

## Reporting security issues

Do **not** open a public issue for vulnerabilities. Follow [SECURITY.md](SECURITY.md).

## Code of Conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
