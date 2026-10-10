import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { eq } from "drizzle-orm";
import { ProfileUpdateSchema, PreferencesUpdateSchema, ConsentUpdateSchema, z } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import { authenticate } from "../../plugins/auth.js";
import { audit } from "../../lib/audit.js";
import { num } from "../../lib/money.js";
import { getConsents, getPreferences, getProfile, loadMe } from "./service.js";

export const meRoutes: FastifyPluginAsyncZod = async (app) => {
  const { db, cipher } = app.ctx;
  app.addHook("preHandler", authenticate);

  app.get("/", { schema: { tags: ["me"] } }, async (req) => loadMe(app.ctx, req.auth!.userId));

  app.patch("/profile", { schema: { tags: ["me"], body: ProfileUpdateSchema } }, async (req) => {
    const b = req.body;
    const set: Partial<typeof schema.userProfiles.$inferInsert> = { updatedAt: new Date() };
    if (b.name !== undefined) set.name = b.name;
    if (b.language !== undefined) set.language = b.language;
    if (b.ageRange !== undefined) set.ageRange = b.ageRange;
    if (b.employment !== undefined) set.employment = b.employment;
    if (b.helpWith !== undefined) set.helpWith = b.helpWith;
    if (b.incomeRange !== undefined) set.incomeRange = b.incomeRange;
    if (b.monthlyIncome !== undefined) set.monthlyIncomeEnc = cipher.encryptNumber(b.monthlyIncome);
    if (b.monthlyExpenses !== undefined) set.monthlyExpensesEnc = cipher.encryptNumber(b.monthlyExpenses);
    if (b.currentSavings !== undefined) set.currentSavingsEnc = cipher.encryptNumber(b.currentSavings);
    if (b.monthlyDebt !== undefined) set.monthlyDebtEnc = cipher.encryptNumber(b.monthlyDebt);
    if (b.primaryGoal !== undefined) set.primaryGoal = b.primaryGoal;
    if (b.mode !== undefined) set.mode = b.mode;
    if (b.onboardingCompleted !== undefined) set.onboardingCompleted = b.onboardingCompleted;
    await db.update(schema.userProfiles).set(set).where(eq(schema.userProfiles.userId, req.auth!.userId));
    return getProfile(app.ctx, req.auth!.userId);
  });

  app.patch("/preferences", { schema: { tags: ["me"], body: PreferencesUpdateSchema } }, async (req) => {
    const current = await getPreferences(app.ctx, req.auth!.userId);
    const next = { ...current, ...req.body };
    await db
      .insert(schema.userPreferences)
      .values({ userId: req.auth!.userId, data: next })
      .onConflictDoUpdate({ target: schema.userPreferences.userId, set: { data: next, updatedAt: new Date() } });
    return next;
  });

  /** Explicit consent changes are appended to an auditable log. */
  app.patch("/consents", { schema: { tags: ["me"], body: ConsentUpdateSchema } }, async (req) => {
    const entries = Object.entries(req.body).filter(([, v]) => typeof v === "boolean") as [string, boolean][];
    if (entries.length) {
      await db.insert(schema.consents).values(entries.map(([type, granted]) => ({ userId: req.auth!.userId, type, granted })));
      await audit(db, req, "consent.updated", req.auth!.userId, Object.fromEntries(entries));
    }
    // Turning off AI history deletes stored conversations.
    if (req.body.aiHistory === false) await db.delete(schema.aiConversations).where(eq(schema.aiConversations.userId, req.auth!.userId));
    return getConsents(app.ctx, req.auth!.userId);
  });

  /** Data portability: everything we hold about the user, decrypted, as JSON. */
  app.get("/export", { schema: { tags: ["me"] } }, async (req, reply) => {
    const userId = req.auth!.userId;
    const [me, tx, rec, budgets, items, goals, contributions, debts, payments, scores, attempts, badges, notes, consents] = await Promise.all([
      loadMe(app.ctx, userId),
      db.select().from(schema.transactions).where(eq(schema.transactions.userId, userId)),
      db.select().from(schema.recurringTransactions).where(eq(schema.recurringTransactions.userId, userId)),
      db.select().from(schema.budgets).where(eq(schema.budgets.userId, userId)),
      db.select({ item: schema.budgetItems }).from(schema.budgetItems).innerJoin(schema.budgets, eq(schema.budgetItems.budgetId, schema.budgets.id)).where(eq(schema.budgets.userId, userId)),
      db.select().from(schema.financialGoals).where(eq(schema.financialGoals.userId, userId)),
      db.select().from(schema.goalContributions).where(eq(schema.goalContributions.userId, userId)),
      db.select().from(schema.debts).where(eq(schema.debts.userId, userId)),
      db.select().from(schema.debtPayments).where(eq(schema.debtPayments.userId, userId)),
      db.select().from(schema.financialHealthScores).where(eq(schema.financialHealthScores.userId, userId)),
      db.select().from(schema.quizAttempts).where(eq(schema.quizAttempts.userId, userId)),
      db.select().from(schema.userAchievements).where(eq(schema.userAchievements.userId, userId)),
      db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)),
      db.select().from(schema.consents).where(eq(schema.consents.userId, userId)),
    ]);
    await audit(db, req, "data.exported", userId);
    reply.header("Content-Disposition", `attachment; filename="sakasuru-export-${new Date().toISOString().slice(0, 10)}.json"`);
    return {
      exportedAt: new Date().toISOString(),
      account: me,
      transactions: tx.map((t) => ({ ...t, amount: num(t.amount), merchant: cipher.decrypt(t.merchantEnc), notes: cipher.decrypt(t.notesEnc), merchantEnc: undefined, notesEnc: undefined })),
      recurring: rec,
      budgets: budgets.map((b) => ({ ...b, items: items.filter((i) => i.item.budgetId === b.id).map((i) => i.item) })),
      goals,
      goalContributions: contributions,
      debts: debts.map((d) => ({ ...d, lender: cipher.decrypt(d.lenderEnc), lenderEnc: undefined })),
      debtPayments: payments,
      healthScores: scores,
      quizAttempts: attempts,
      badges,
      notifications: notes,
      consentHistory: consents,
    };
  });

  /** Right to erasure: cascades delete every row owned by the user. */
  app.delete("/", { schema: { tags: ["me"], body: z.object({ confirm: z.literal("DELETE") }) } }, async (req, reply) => {
    const userId = req.auth!.userId;
    await audit(db, req, "account.deleted", null, { userIdHash: userId.slice(0, 8) });
    await db.delete(schema.users).where(eq(schema.users.id, userId));
    reply.clearCookie("sk_refresh", { path: "/api/v1/auth" });
    return { ok: true as const };
  });
};
