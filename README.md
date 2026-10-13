<p align="center"><img src="apps/web/public/icon.svg" width="72" alt="" /></p>

<h1 align="center">සකසුරු · Sakasuru</h1>
<p align="center"><b>දැනගෙන උපයමු. හිතලා වියදම් කරමු. හෙටට ඉතිරි කරමු.</b><br/>Learn Money. Manage Better. Build Tomorrow.</p>

A financial-literacy and personal-finance platform built for Sri Lanka — in **Sinhala, Tamil and English**. It combines everyday money management, a story-based money academy, transparent financial-health scoring, scam protection and an education-only AI assistant.

> සකසුරු provides financial education and planning tools. It is not a bank, broker or licensed financial adviser, and it never tells people what to buy, borrow or invest in.

![Dashboard](docs/screenshots/dashboard-desktop-si.png)

| Home (mobile) | Lesson | Learn (Tamil) | Ask සකසුරු |
|---|---|---|---|
| ![](docs/screenshots/home-mobile-si.png) | ![](docs/screenshots/lesson-mobile-si.png) | ![](docs/screenshots/learn-mobile-ta.png) | ![](docs/screenshots/ask-mobile-en.png) |

**Dark mode**

![Dashboard in dark mode](docs/screenshots/dashboard-desktop-dark.png)

## What's inside

- **Money** — 5-second quick add, needs vs wants, LANKAQR and other payment methods, recurring bills with reminders, CSV import (never bank passwords), monthly budgets, savings goals, emergency-fund planner, debt manager with snowball/avalanche and "pay Rs. X extra" simulator, monthly report.
- **Financial Health Score** — 0–100 from eight visible factors, drawn as eight petals. Educational only; never a credit score.
- **Learn Money Academy** — 8 levels, 19 trilingual micro-lessons with Sri Lankan stories (Amaya, Nimal, Fathima, Sumana…), 57 explained quiz questions, sources and review dates, XP, streaks, badges and weekly challenges. Badges never reward borrowing or trading.
- **13 calculators** — loans, housing, leasing, fixed deposits, compound interest, inflation, retirement, credit cards and more, all decimal-safe.
- **Scam Shield** — Sinhala/Tamil/English warning-sign checker, Scam-or-Safe quiz, protection lessons.
- **Ask සකසුරු** — answers from a verified, sourced knowledge base; says when it doesn't know; refuses product recommendations; personal insights only with consent and only the data needed.
- **Admin** — aggregated analytics, CMS with draft → review → approved → published, seven RBAC roles, audit log.
- **Privacy & security** — Argon2id, rotating refresh tokens with reuse detection, AES-256-GCM field encryption, consent log, data export, account deletion, rate limits, CSP.
- **Built for Sri Lankan phones** — installable PWA, offline lessons and calculators, self-hosted fonts (Yaldevi, Anek Tamil, Anek Latin), data-saver mode, text sizing, high contrast, and light / dark / follow-device themes.

## Stack

| | |
|---|---|
| Web | React 19, Vite, Tailwind CSS v4, TanStack Query, motion, Recharts, PWA |
| API | Node 22, Fastify 5, zod, OpenAPI/Swagger (`/docs`) |
| Data | PostgreSQL 16, Drizzle ORM + SQL migrations |
| Shared | `financial-engine` (decimal.js), `content`, `localization`, `validation` |
| Tests | Vitest — 172 tests incl. API integration tests against real PostgreSQL |

## Run it

**Demo, no backend** (data stays in the browser):

```bash
corepack enable && pnpm install && pnpm build
pnpm --filter @sakasuru/web preview     # http://localhost:4173 → "Explore the demo"
```

**Full stack with Docker:**

```bash
docker compose up --build               # http://localhost:4000 · API docs at /docs
```

**Full stack for development:**

```bash
cp .env.example apps/api/.env            # set DATABASE_URL, JWT_SECRET, DATA_ENCRYPTION_KEY
pnpm install && pnpm build
pnpm db:migrate && pnpm db:seed         # ADMIN_EMAIL / ADMIN_PASSWORD create a super admin
pnpm dev:api                            # :4000
VITE_API_URL=http://localhost:4000 pnpm dev:web   # :5173
```

**Tests:** `pnpm test` (API tests use `TEST_DATABASE_URL`, default `postgres://sakasuru:sakasuru@localhost:5432/sakasuru_test`).

## Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/sadeepmithuranda/sakasuru)

`render.yaml` creates a PostgreSQL database and one web service that runs migrations, seeds the lessons and serves both the API and the web app. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create the first administrator, update `CORS_ORIGINS` to your service URL, and optionally add `ANTHROPIC_API_KEY`. The `Dockerfile` works on any container host.

## Docs

[Product requirements](docs/01-product-requirements.md) · [Architecture, ER diagram & API](docs/02-architecture.md) · [Security & privacy](docs/03-security-privacy.md) · [AI / RAG](docs/04-ai-rag.md) · [Design system](docs/05-design-system.md) · [Roadmap](docs/06-roadmap.md)

## Status

Phase 1 MVP is complete and tested. Not yet built: native mobile app, phone OTP / 2FA / password-reset email (need an SMS/email provider), family and small-business modes, community, investment simulator, bank integrations. Sinhala and Tamil copy should be reviewed by native speakers and every lesson by a financial-education reviewer before public launch. Rates and rules in lessons are flagged for periodic review and always point to official sources (CBSL, SEC, CSE, IRD).

## License

MIT
