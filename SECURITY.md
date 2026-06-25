# Security Policy

ScamWatch handles sensitive consumer reports and is itself a target for the actors it documents. We take security seriously and welcome coordinated disclosure. This policy aligns with PRD Volume 14 (Security).

## Reporting a vulnerability

- **Email:** security@scamwatch.org (PGP key to be published; a GitHub private security advisory will also be accepted once the repo is public).
- **Please include:** affected component/URL, steps to reproduce, impact, and any PoC. Encrypt if the details are sensitive.
- **Do not** open a public issue, PR, or discussion for a vulnerability.

## Our commitment (response SLAs by severity)

| Severity           | Example                                           | Acknowledge      | Triage  | Target fix    |
| ------------------ | ------------------------------------------------- | ---------------- | ------- | ------------- |
| **Sev-1** Critical | RCE, auth bypass, mass PII exposure               | 24 h             | 48 h    | ASAP / hotfix |
| **Sev-2** High     | Stored XSS, IDOR on reports, privilege escalation | 2 business days  | 5 days  | ≤ 30 days     |
| **Sev-3** Medium   | CSRF on low-impact action, info leak              | 5 business days  | 10 days | ≤ 90 days     |
| **Sev-4** Low      | Best-practice gaps, rate-limit tuning             | 10 business days | —       | backlog       |

We will keep you updated, credit you (if you wish) in our advisories, and notify you when the issue is resolved.

## Safe harbor

We will not pursue or support legal action against researchers who:

- Act in good faith and avoid privacy violations, data destruction, and service degradation.
- **Never test against real victim data**, and never exfiltrate or retain PII.
- Do **not** run denial-of-service, spam, social-engineering, or physical attacks.
- Give us reasonable time to remediate before public disclosure.

## Out of scope

- Findings requiring physical access to a user's device.
- Reports from automated scanners without a demonstrated, exploitable impact.
- Social engineering of ScamWatch staff or volunteers.

## Machine-readable policy

See [`/.well-known/security.txt`](public/.well-known/security.txt).
