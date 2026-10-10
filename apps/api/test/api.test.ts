import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { sql, eq } from "drizzle-orm";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { createDb, schema } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { seedContent, seedAdmin } from "../src/db/seed.js";
import { FieldCipher } from "../src/lib/crypto.js";

/**
 * Integration tests against a real PostgreSQL database.
 * Set TEST_DATABASE_URL (defaults to a local sakasuru_test database).
 */
const DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://sakasuru:sakasuru@localhost:5432/sakasuru_test";
const config = loadConfig({
  NODE_ENV: "test",
  DATABASE_URL,
  JWT_SECRET: "test-secret-test-secret-test-secret-123456",
  DATA_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
  RATE_LIMIT_MAX: "10000",
  AUTH_RATE_LIMIT: "10000",
} as NodeJS.ProcessEnv);

let app: Awaited<ReturnType<typeof buildApp>>;
const { db, pool } = createDb(DATABASE_URL);
const fixedNow = new Date("2026-10-15T06:00:00Z");

beforeAll(async () => {
  await runMigrations(DATABASE_URL);
  await db.execute(sql`truncate users, courses, lessons, ai_topic_stats, scam_alerts, audit_logs cascade`);
  await seedContent(db);
  app = await buildApp({ config, db, cipher: new FieldCipher(config.DATA_ENCRYPTION_KEY), ai: null, now: () => fixedNow });
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

const api = (method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE", url: string, token?: string, payload?: unknown, headers: Record<string, string> = {}) =>
  app.inject({ method, url: `/api/v1${url}`, payload: payload as never, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers } });

async function register(email: string, password = "correct horse battery") {
  const res = await api("POST", "/auth/register", undefined, { email, password, name: "Kasun", language: "si", acceptTerms: true });
  expect(res.statusCode).toBe(201);
  const body = res.json();
  const cookie = res.cookies.find((c) => c.name === "sk_refresh");
  return { token: body.accessToken as string, refresh: body.refreshToken as string, cookie: cookie?.value, me: body.me };
}

describe("auth & sessions", () => {
  it("registers with secure defaults (AI access off, Sinhala)", async () => {
    const { me, cookie } = await register("kasun@example.lk");
    expect(me.profile.language).toBe("si");
    expect(me.consents).toEqual({ aiDataAccess: false, aiHistory: false, analytics: false });
    expect(cookie).toBeTruthy();
    const [u] = await db.select().from(schema.users).where(eq(schema.users.email, "kasun@example.lk"));
    expect(u!.passwordHash.startsWith("$argon2id$")).toBe(true);
  });

  it("rejects duplicate emails and weak passwords", async () => {
    expect((await api("POST", "/auth/register", undefined, { email: "kasun@example.lk", password: "another long pass", name: "X", acceptTerms: true })).statusCode).toBe(409);
    expect((await api("POST", "/auth/register", undefined, { email: "new@example.lk", password: "short", name: "X", acceptTerms: true })).statusCode).toBe(400);
  });

  it("locks the account after repeated failures", async () => {
    await register("lock@example.lk");
    for (let i = 0; i < 5; i++) expect((await api("POST", "/auth/login", undefined, { email: "lock@example.lk", password: "wrong password!" })).statusCode).toBe(401);
    const locked = await api("POST", "/auth/login", undefined, { email: "lock@example.lk", password: "correct horse battery" });
    expect(locked.statusCode).toBe(429);
  });

  it("rotates refresh tokens and revokes the family on reuse", async () => {
    const { refresh } = await register("rotate@example.lk");
    const r1 = await api("POST", "/auth/refresh", undefined, { refreshToken: refresh });
    expect(r1.statusCode).toBe(200);
    const next = r1.json().refreshToken;
    expect(next).not.toBe(refresh);
    // Reusing the old token is detected …
    expect((await api("POST", "/auth/refresh", undefined, { refreshToken: refresh })).statusCode).toBe(401);
    // … and the whole family, including the newest token, is revoked.
    expect((await api("POST", "/auth/refresh", undefined, { refreshToken: next })).statusCode).toBe(401);
  });

  it("requires the CSRF header when refreshing via cookie", async () => {
    const { cookie } = await register("csrf@example.lk");
    const noHeader = await app.inject({ method: "POST", url: "/api/v1/auth/refresh", cookies: { sk_refresh: cookie! } });
    expect(noHeader.statusCode).toBe(401);
    const ok = await app.inject({ method: "POST", url: "/api/v1/auth/refresh", cookies: { sk_refresh: cookie! }, headers: { "x-requested-with": "sakasuru" } });
    expect(ok.statusCode).toBe(200);
  });

  it("rejects requests without a valid token", async () => {
    expect((await api("GET", "/dashboard")).statusCode).toBe(401);
    expect((await api("GET", "/dashboard", "not-a-jwt")).statusCode).toBe(401);
  });
});

describe("profile, privacy & encryption", () => {
  it("encrypts financial profile fields at rest", async () => {
    const { token } = await register("enc@example.lk");
    const res = await api("PATCH", "/me/profile", token, { monthlyIncome: 85000, onboardingCompleted: true, helpWith: ["saveMore"] });
    expect(res.json().monthlyIncome).toBe(85000);
    const rows = await db.execute(sql`select monthly_income_enc from user_profiles p join users u on u.id = p.user_id where u.email = 'enc@example.lk'`);
    const stored = (rows.rows[0] as { monthly_income_enc: string }).monthly_income_enc;
    expect(stored.startsWith("v1.")).toBe(true);
    expect(stored).not.toContain("85000");
  });

  it("logs consent changes", async () => {
    const { token } = await register("consent@example.lk");
    const res = await api("PATCH", "/me/consents", token, { aiDataAccess: true });
    expect(res.json().aiDataAccess).toBe(true);
    const log = await db.execute(sql`select count(*)::int as c from consents c join users u on u.id = c.user_id where u.email = 'consent@example.lk' and c.type = 'aiDataAccess'`);
    expect((log.rows[0] as { c: number }).c).toBe(2);
  });
});

describe("money", () => {
  let token: string;
  let other: string;
  beforeAll(async () => {
    token = (await register("money@example.lk")).token;
    other = (await register("other@example.lk")).token;
  });

  it("records transactions with suggested needs/wants and encrypted merchant", async () => {
    await api("POST", "/transactions", token, { type: "income", amount: 85000, categoryKey: "salary", date: "2026-10-01" });
    const res = await api("POST", "/transactions", token, { type: "expense", amount: 450, categoryKey: "eatingOut", date: "2026-10-10", merchant: "Lunch at Pilawoos", method: "lankaqr" });
    expect(res.statusCode).toBe(201);
    expect(res.json().needWant).toBe("want");
    expect(res.json().merchant).toBe("Lunch at Pilawoos");
    const raw = await db.execute(sql`select merchant_enc from transactions where id = ${res.json().id}`);
    expect((raw.rows[0] as { merchant_enc: string }).merchant_enc).not.toContain("Pilawoos");
    await api("POST", "/transactions", token, { type: "expense", amount: 20000, categoryKey: "rent", date: "2026-10-02", recurring: true, merchant: "Rent" });
    await api("POST", "/transactions", token, { type: "expense", amount: 12000, categoryKey: "groceries", date: "2026-10-05" });
  });

  it("validates amounts and categories", async () => {
    expect((await api("POST", "/transactions", token, { type: "expense", amount: -5, categoryKey: "rent", date: "2026-10-01" })).statusCode).toBe(400);
    expect((await api("POST", "/transactions", token, { type: "expense", amount: 5, categoryKey: "bitcoin", date: "2026-10-01" })).statusCode).toBe(400);
  });

  it("prevents access to another user's data (IDOR)", async () => {
    const list = (await api("GET", "/transactions", token)).json();
    const id = list[0].id;
    expect((await api("DELETE", `/transactions/${id}`, other)).statusCode).toBe(404);
    expect((await api("PATCH", `/transactions/${id}`, other, { amount: 1 })).statusCode).toBe(404);
    expect((await api("GET", "/transactions", other)).json()).toHaveLength(0);
  });

  it("saves budgets and goals and builds the dashboard", async () => {
    const b = await api("PUT", "/budgets/2026-10", token, { income: 85000, items: [{ categoryKey: "rent", planned: 20000 }, { categoryKey: "groceries", planned: 15000 }, { categoryKey: "eatingOut", planned: 3000 }] });
    expect(b.json().items).toHaveLength(3);
    const g = await api("POST", "/goals", token, { name: "Emergency fund", type: "emergency", target: 180000, saved: 80000, deadline: "2027-06-30" });
    expect(g.statusCode).toBe(201);
    const c = await api("POST", `/goals/${g.json().id}/contributions`, token, { amount: 2500 });
    expect(c.json().saved).toBe(82500);
    await api("POST", "/recurring", token, { name: "Electricity", amount: 4800, categoryKey: "electricity", dayOfMonth: 17 });
    const d = (await api("GET", "/dashboard", token)).json();
    expect(d.income).toBe(85000);
    expect(d.spent).toBe(32450);
    expect(d.saved).toBe(2500);
    expect(d.remaining).toBe(50050);
    expect(d.health.score).toBeGreaterThan(0);
    expect(d.health.factors).toHaveLength(8);
    expect(d.upcomingBills[0].name).toBe("Electricity");
    expect(d.upcomingBills[0].daysUntil).toBe(2);
    expect(d.emergencyFund).toBe(82500);
  });

  it("simulates debt strategies", async () => {
    await api("POST", "/debts", token, { type: "creditCard", balance: 80000, ratePercent: 28, monthlyPayment: 4000 });
    await api("POST", "/debts", token, { type: "personal", lender: "Bank", balance: 300000, ratePercent: 16, monthlyPayment: 12000, dueDay: 25 });
    const sim = (await api("GET", "/debts/simulate?extra=5000", token)).json();
    expect(sim.avalanche.totalInterest).toBeLessThanOrEqual(sim.snowball.totalInterest);
    expect(sim.perDebt[0].monthsSaved).toBeGreaterThan(0);
  });

  it("imports CSV rows", async () => {
    const res = await api("POST", "/transactions/import", token, { rows: [{ date: "2026-09-03", amount: -1500, description: "Keells" }, { date: "2026-09-01", amount: 80000, description: "Salary", categoryKey: "salary" }] });
    expect(res.json().imported).toBe(2);
  });

  it("produces a monthly report", async () => {
    const r = (await api("GET", "/reports/monthly?month=2026-10", token)).json();
    expect(r.income).toBe(85000);
    expect(r.largestCategory.categoryKey).toBe("rent");
  });

  it("awards habit badges", async () => {
    const learning = (await api("GET", "/learning", token)).json();
    const keys = learning.badges.map((b: { key: string }) => b.key);
    expect(keys).toEqual(expect.arrayContaining(["firstExpense", "firstBudget", "emergencyStarter"]));
  });

  it("creates useful notifications", async () => {
    const n = (await api("GET", "/notifications", token)).json();
    expect(n.some((x: { key: string }) => x.key === "notifications.billDue" || x.key === "notifications.badge")).toBe(true);
  });
});

describe("learning", () => {
  it("serves published lessons publicly and grades quizzes server-side", async () => {
    const courses = (await api("GET", "/courses")).json();
    expect(courses).toHaveLength(8);
    const lesson = (await api("GET", "/lessons/why-save")).json();
    expect(lesson.quiz.length).toBeGreaterThanOrEqual(3);
    const { token } = await register("learner@example.lk");
    const answers = Object.fromEntries(lesson.quiz.map((q: { id: string; correctId: string }) => [q.id, q.correctId]));
    const res = (await api("POST", "/lessons/why-save/complete", token, { answers })).json();
    expect(res.correct).toBe(res.total);
    expect(res.xpEarned).toBe(30); // 20 XP + 10 perfect bonus
    expect(res.newBadges).toContain("quizAce");
    expect(res.learning.streak).toBe(1);
    // Repeating gives only practice XP.
    const again = (await api("POST", "/lessons/why-save/complete", token, { answers })).json();
    expect(again.xpEarned).toBe(5);
  });

  it("joins challenges", async () => {
    const { token } = await register("challenger@example.lk");
    const s = (await api("POST", "/challenges/learn3/join", token)).json();
    expect(s.challenges[0].key).toBe("learn3");
  });
});

describe("scam checker & AI", () => {
  it("checks scam messages without auth", async () => {
    const r = (await api("POST", "/scam/check", undefined, { text: "Congratulations! You have won Rs. 500,000. Send your bank details now." })).json();
    expect(r.risk).toBe("high");
  });

  it("answers from the verified knowledge base with sources", async () => {
    const r = (await api("POST", "/ai/ask", undefined, { question: "What is LANKAQR?", lang: "en" })).json();
    expect(r.mode).toBe("knowledge");
    expect(r.sources[0].url).toContain("cbsl.gov.lk");
    const si = (await api("POST", "/ai/ask", undefined, { question: "උද්ධමනය යනු කුමක්ද?", lang: "si" })).json();
    expect(si.answer).toContain("උද්ධමනය");
  });

  it("says it lacks verified info instead of guessing", async () => {
    const r = (await api("POST", "/ai/ask", undefined, { question: "What will the dollar rate be next year?", lang: "en" })).json();
    expect(r.mode).toBe("low-confidence");
  });

  it("refuses to recommend specific investments", async () => {
    const r = (await api("POST", "/ai/ask", undefined, { question: "Which stock should I buy?", lang: "en" })).json();
    expect(r.answer).toContain("can't tell you to buy");
  });

  it("only uses personal data with explicit consent, and only what is needed", async () => {
    const { token } = await register("ai@example.lk");
    await api("POST", "/transactions", token, { type: "expense", amount: 4600, categoryKey: "foodDelivery", date: "2026-10-09" });
    await api("POST", "/transactions", token, { type: "expense", amount: 3000, categoryKey: "bus", date: "2026-10-09" });
    const off = (await api("POST", "/ai/ask", token, { question: "How much did I spend on food this month?", lang: "en" })).json();
    expect(off.usedFields).toEqual([]);
    expect(off.answer).toContain("Personal insights are off");
    await api("PATCH", "/me/consents", token, { aiDataAccess: true });
    const on = (await api("POST", "/ai/ask", token, { question: "How much did I spend on food this month?", lang: "en" })).json();
    expect(on.answer).toContain("Rs. 4,600");
    expect(on.usedFields).toEqual(["expenses.food.2026-10"]);
  });
});

describe("admin, RBAC & CMS", () => {
  let admin: string;
  let user: string;
  let userId: string;
  beforeAll(async () => {
    await seedAdmin(db, "admin@sakasuru.lk", "admin password 123");
    admin = (await api("POST", "/auth/login", undefined, { email: "admin@sakasuru.lk", password: "admin password 123" })).json().accessToken;
    const u = await register("creator@example.lk");
    user = u.token;
    userId = u.me.user.id;
  });

  it("blocks regular users from admin endpoints", async () => {
    expect((await api("GET", "/admin/stats", user)).statusCode).toBe(403);
    expect((await api("GET", "/admin/lessons", user)).statusCode).toBe(403);
  });

  it("shows aggregated stats only", async () => {
    const s = (await api("GET", "/admin/stats", admin)).json();
    expect(s.users).toBeGreaterThan(5);
    expect(JSON.stringify(s)).not.toContain("amount");
  });

  it("runs the content workflow draft → review → approved → published", async () => {
    await api("PATCH", `/admin/users/${userId}/role`, admin, { role: "creator" });
    const existing = (await api("GET", "/admin/lessons/why-save", admin)).json();
    const draft = { ...existing, slug: "first-salary", courseSlug: "money-basics", title: { en: "Your first salary", si: "ඔබේ පළමු වැටුප", ta: "உங்கள் முதல் சம்பளம்" } };
    delete draft.status;
    delete draft.lastReviewed;
    delete draft.nextReview;
    const created = await api("PUT", "/admin/lessons/first-salary", user, draft);
    expect(created.statusCode).toBe(200);
    expect(created.json().status).toBe("draft");
    expect((await api("GET", "/lessons/first-salary")).statusCode).toBe(404); // not public yet
    expect((await api("POST", "/admin/lessons/first-salary/status", user, { status: "review" })).statusCode).toBe(200);
    expect((await api("POST", "/admin/lessons/first-salary/status", user, { status: "approved" })).statusCode).toBe(403); // creator can't approve
    expect((await api("POST", "/admin/lessons/first-salary/status", admin, { status: "published" })).statusCode).toBe(400); // must be approved first
    expect((await api("POST", "/admin/lessons/first-salary/status", admin, { status: "approved" })).statusCode).toBe(200);
    expect((await api("POST", "/admin/lessons/first-salary/status", admin, { status: "published" })).statusCode).toBe(200);
    expect((await api("GET", "/lessons/first-salary")).statusCode).toBe(200);
  });

  it("does not let admins escalate beyond their own role", async () => {
    const res = await api("PATCH", `/admin/users/${userId}/role`, user, { role: "superadmin" });
    expect(res.statusCode).toBe(403);
  });

  it("records an audit trail", async () => {
    const logs = (await api("GET", "/admin/audit-logs", admin)).json();
    expect(logs.some((l: { action: string }) => l.action === "cms.status_changed")).toBe(true);
  });
});

describe("data rights", () => {
  it("exports and deletes everything", async () => {
    const { token } = await register("leave@example.lk");
    await api("POST", "/transactions", token, { type: "expense", amount: 100, categoryKey: "bus", date: "2026-10-10", notes: "secret note" });
    const exp = await api("GET", "/me/export", token);
    expect(exp.json().transactions[0].notes).toBe("secret note");
    expect((await api("DELETE", "/me", token, { confirm: "NO" })).statusCode).toBe(400);
    expect((await api("DELETE", "/me", token, { confirm: "DELETE" })).statusCode).toBe(200);
    const left = await db.execute(sql`select count(*)::int as c from users where email = 'leave@example.lk'`);
    expect((left.rows[0] as { c: number }).c).toBe(0);
  });
});
