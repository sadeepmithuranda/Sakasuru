# Security & privacy

Financial data is sensitive. The design follows least data, explicit consent and defence in depth, and aims to align with Sri Lanka's Personal Data Protection Act No. 9 of 2022 (legal review is still required before launch).

## Implemented

| Control | Where |
|---|---|
| Password hashing — Argon2id (OWASP parameters), constant-ish time for unknown emails | `modules/auth` |
| Short-lived JWT access tokens (15 min) kept in memory; httpOnly refresh cookie, rotated on every use, **reuse detection revokes the whole session family** | `modules/auth` |
| CSRF guard on cookie refresh (`X-Requested-With`), SameSite cookies, CORS allow-list | `modules/auth`, `app.ts` |
| Brute force: per-IP rate limits on auth, account lock after 5 failures for 15 minutes; global rate limit | `app.ts`, `modules/auth` |
| RBAC: user → creator → reviewer → moderator → admin → superadmin; role re-read from the DB on privileged routes; no self-escalation | `plugins/auth.ts`, `modules/admin` |
| Every query scoped by `user_id` (IDOR tests included) | all modules |
| Input validation with zod on every route; JSON body limit | `packages/validation` |
| SQL injection: parameterised queries only (Drizzle) | data layer |
| AES-256-GCM field encryption for merchant, notes, lender, AI messages and onboarding amounts | `lib/crypto.ts` |
| Security headers (helmet) and a strict CSP when the web app is served by the API | `app.ts` |
| Audit log for logins, failures, lockouts, consent changes, exports, deletions, role and CMS changes — never amounts or message text | `lib/audit.ts` |
| Suspicious sign-in notification on a new device | `modules/auth` |
| Session list and remote sign-out; password change signs out other sessions | `modules/auth` |
| Logs redact authorization headers and cookies | `app.ts` |
| Secrets only from environment; config validated at boot | `config.ts` |
| Dependency scanning: Dependabot + `pnpm audit` in CI | `.github/` |

**Never stored:** raw passwords, card numbers, PINs, CVVs, banking passwords, OTPs. The app never asks for internet-banking credentials; bank data comes in only through user-initiated CSV import.

## User rights

- **Consent** — AI data access, AI history and analytics are **off by default**; every change is appended to `consents` (auditable).
- **Access / portability** — `GET /me/export` returns everything, decrypted, as JSON.
- **Correction** — profile and records are editable.
- **Erasure** — `DELETE /me` (typed confirmation) cascades every row.
- **AI control** — turning AI history off deletes stored conversations.

## Analytics

Admin analytics are aggregates (counts, averages, language split, anonymous AI topic counters). Individual financial records are never shown in admin views, and institutions would only ever receive aggregates.

## Operations (to do at deployment)

HTTPS/TLS is provided by the host. Configure managed-database backups and point-in-time recovery, separate staging/production environments and secrets, key rotation (cipher format is versioned `v1.`), and an incident-response contact.

## Known gaps

Two-factor authentication, phone OTP and password-reset email need an SMS/email provider and are not built. Penetration testing and a formal PDPA assessment have not been done.
