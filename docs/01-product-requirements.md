# සකසුරු — Product Requirements

**Sakasuru** · *දැනගෙන උපයමු. හිතලා වියදම් කරමු. හෙටට ඉතිරි කරමු.* · Learn Money. Manage Better. Build Tomorrow.

## 1. Purpose

A Sri Lankan financial-literacy and personal-finance platform that improves financial knowledge, saving behaviour, responsible borrowing, safe investing and scam awareness — in Sinhala, Tamil and English.

සකසුරු is **education + planning + behaviour change**. It is not a bank, broker or licensed adviser, and it never tells people what to buy, borrow or invest in.

## 2. Principles

Education over selling · Empowerment over dependency · Transparency over manipulation · Privacy over monetisation · Long-term financial health over short-term engagement. The app never exploits financial anxiety, never shames spending, and never rewards borrowing, trading frequency or risk-taking.

## 3. Personas

| Persona | Situation | What they need first |
|---|---|---|
| **Kasun, 27, Colombo** — office worker | Rs. 85,000 salary, a personal loan, saves irregularly | Budget, emergency fund, debt simulator |
| **Amaya, 24, Kandy** — first job | Spends everything, laptop broke | "Why save" lesson, savings goal |
| **Fathima, 35, Batticaloa** — nurse, Tamil-first | Supports family, wants to plan | Tamil UI, household budget, EPF/ETF basics |
| **Nimal, 52, Kurunegala** — three-wheeler driver | Cash income, informal loans | Quick-add in seconds, loan & scam lessons, Sinhala voice input |
| **Sumana, 44, Galle** — home bakery | Business and home money mixed | Revenue vs profit vs cash flow, separate records |
| **Dilani, 20, Moratuwa** — university student | Allowance + boarding | Student mode, needs vs wants, first bank account |
| **Migrant-worker family, Kegalle** | Monthly remittance | Remittance as income, emergency fund, Ponzi awareness |

## 4. Key user journeys

1. **First visit → plan in 2 minutes:** Welcome → language → account → 8 optional questions (income can be skipped or given as a range) → Financial Health Score explained as an educational indicator → dashboard.
2. **Daily:** tap **+** → amount → category → Save (under 5 seconds; most-used categories first). Needs/wants is suggested and editable.
3. **Monthly:** set budget (savings first) → progress bars → alerts at 80% / 100% → Monthly Report → score change explained factor by factor.
4. **Learn:** 3-minute story-first lesson → quiz with explanations for every answer → XP, streak, badges.
5. **Protect:** paste a suspicious SMS into Scam Checker → risk level + warning signs + "verify through official channels".
6. **Ask:** "What is a fixed deposit?" → verified answer with sources and review date. "How much did I spend on food?" → only with explicit consent, only the food total is used.

## 5. Feature hierarchy and build status

✅ built and tested · 🟡 partial (honest limits noted) · ⏳ later phase

**Account & onboarding** — ✅ email/password (Argon2id), refresh-token rotation, sessions & revocation, lockout; ✅ language-first onboarding; ⏳ phone OTP, Google/Apple sign-in, biometric, 2FA, password-reset email (needs an email/SMS provider).

**Money** — ✅ income & expense tracking, quick add, needs/wants, 7 payment methods incl. LANKAQR; ✅ recurring payments + reminders; ✅ CSV import (no bank credentials ever); ✅ monthly budget with live summary & savings rate; ✅ savings goals (create/contribute/pause/archive, monthly amount needed); ✅ emergency fund planner (1/3/6/12 months); ✅ debt manager, DTI, payoff estimate; ✅ snowball/avalanche + "pay Rs. X extra" simulator; ✅ monthly report (shareable without amounts); ⏳ yearly "Money Story", bank/API integrations.

**Financial Health Score** — ✅ 0–100, eight transparent factors, rules shown in-app, history, "what could improve it"; never used for eligibility.

**Learn Money Academy** — ✅ 8 levels, 19 trilingual lessons, 57 quiz questions, sources + review dates, time-sensitive flags, prerequisites before investing, personalised recommendations, multilingual search ("loan" = "ණය"); ✅ XP, levels, streaks, 10 badges, 6 weekly challenges; 🟡 more lessons per level are added through the CMS.

**Calculators** — ✅ 13: savings goal, compound interest, loan, housing loan, vehicle loan/lease, fixed deposit, emergency fund, inflation, investment growth, retirement, debt payoff, credit card, simple vs compound. All decimal-safe.

**Scam Shield** — ✅ trilingual rule-based checker (Low / Suspicious / High, never "safe"), Scam-or-Safe quiz, red flags, protection lessons.

**සකසුරු AI** — ✅ retrieval over a verified, sourced knowledge base (en/si/ta); ✅ refuses product recommendations; ✅ "not enough verified information" fallback; ✅ consent-gated personal insights using least data; 🟡 optional LLM phrasing (Anthropic) only when an API key is configured; ✅ voice input via the browser's speech recognition where supported.

**Privacy** — ✅ field encryption, consent log, data export, account deletion, AI controls, anonymous analytics only.

**Admin** — ✅ aggregated analytics (no individual finances), CMS with draft → review → approved → published workflow, RBAC (7 roles), user roles, audit log, review-due tracking.

**Platforms** — ✅ responsive web app, installable PWA with offline lessons/quizzes/calculators and self-hosted fonts, data-saver & reduced-motion modes; ⏳ native React Native app (the web app is the Android-first PWA for now).

**Modes** — ✅ Student mode flag; ⏳ Family mode (role-based household budgets), Small Business mode, Community, Investment simulator, Money Today news.

## 6. Success metrics

Not time-in-app. Measured: knowledge improvement (quiz results), budget adoption, savings consistency, goal completion, emergency-fund growth, reduced high-interest debt, scam-recognition accuracy, course completion, retention.
