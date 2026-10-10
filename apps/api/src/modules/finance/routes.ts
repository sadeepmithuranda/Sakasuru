import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { suggestNeedWant, getCategory, simulateDebtStrategy, simulateExtraPayment, D, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@sakasuru/financial-engine";

const EXPENSE_KEYS = new Set<string>(EXPENSE_CATEGORIES.map((c) => c.key));
const INCOME_KEYS = new Set<string>(INCOME_CATEGORIES.map((c) => c.key));
import {
  TransactionSchema,
  TransactionUpdateSchema,
  TransactionQuerySchema,
  CsvImportSchema,
  RecurringSchema,
  BudgetSchema,
  MonthKeySchema,
  GoalSchema,
  GoalUpdateSchema,
  ContributionSchema,
  DebtSchema,
  DebtUpdateSchema,
  z,
} from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import { authenticate } from "../../plugins/auth.js";
import { notFound } from "../../lib/errors.js";
import { dec, num } from "../../lib/money.js";
import { buildDashboard, debtDTO, getBudget, goalDTO, listDebts, listGoals, listRecurring, recurringDTO, toTransactionDTO, transactionsInRange } from "./service.js";
import { awardBadges } from "../learning/service.js";

const idParam = z.object({ id: z.string().uuid() });

export const financeRoutes: FastifyPluginAsyncZod = async (app) => {
  const { db, cipher } = app.ctx;
  app.addHook("preHandler", authenticate);

  /* ------------------------------ dashboard ------------------------------ */

  app.get("/dashboard", { schema: { tags: ["finance"] } }, async (req) => buildDashboard(app.ctx, req.auth!.userId));

  app.get("/health-score/history", { schema: { tags: ["finance"] } }, async (req) => {
    const rows = await db
      .select({ month: schema.financialHealthScores.month, score: schema.financialHealthScores.score })
      .from(schema.financialHealthScores)
      .where(eq(schema.financialHealthScores.userId, req.auth!.userId))
      .orderBy(desc(schema.financialHealthScores.month))
      .limit(12);
    return rows.reverse();
  });

  /* ------------------------------ transactions ------------------------------ */

  app.get("/transactions", { schema: { tags: ["finance"], querystring: TransactionQuerySchema } }, async (req) => {
    const q = req.query;
    const rows = await transactionsInRange(app.ctx, req.auth!.userId, q.from, q.to);
    return rows
      .filter((t) => (!q.type || t.type === q.type) && (!q.categoryKey || t.categoryKey === q.categoryKey) && (!q.method || t.method === q.method))
      .slice(0, q.limit)
      .map((t) => toTransactionDTO(app.ctx, t));
  });

  app.post("/transactions", { schema: { tags: ["finance"], body: TransactionSchema } }, async (req, reply) => {
    const b = req.body;
    const userId = req.auth!.userId;
    let recurringId: string | null = null;
    if (b.recurring && b.type === "expense") {
      const [r] = await db
        .insert(schema.recurringTransactions)
        .values({ userId, name: b.merchant || getCategory(b.categoryKey).key, amount: dec(b.amount), categoryKey: b.categoryKey, dayOfMonth: Number(b.date.slice(8, 10)) })
        .returning({ id: schema.recurringTransactions.id });
      recurringId = r!.id;
    }
    const [row] = await db
      .insert(schema.transactions)
      .values({
        userId,
        type: b.type,
        amount: dec(b.amount),
        categoryKey: b.categoryKey,
        date: b.date,
        merchantEnc: cipher.encrypt(b.merchant),
        method: b.method ?? null,
        notesEnc: cipher.encrypt(b.notes),
        needWant: b.type === "expense" ? (b.needWant ?? suggestNeedWant(b.categoryKey)) : null,
        recurringId,
      })
      .returning();
    await awardBadges(app.ctx, userId);
    reply.code(201);
    return toTransactionDTO(app.ctx, row!);
  });

  app.patch("/transactions/:id", { schema: { tags: ["finance"], params: idParam, body: TransactionUpdateSchema } }, async (req) => {
    const b = req.body;
    const set: Partial<typeof schema.transactions.$inferInsert> = { updatedAt: new Date() };
    if (b.type) set.type = b.type;
    if (b.amount !== undefined) set.amount = dec(b.amount);
    if (b.categoryKey) set.categoryKey = b.categoryKey;
    if (b.date) set.date = b.date;
    if (b.merchant !== undefined) set.merchantEnc = cipher.encrypt(b.merchant);
    if (b.method !== undefined) set.method = b.method;
    if (b.notes !== undefined) set.notesEnc = cipher.encrypt(b.notes);
    if (b.needWant !== undefined) set.needWant = b.needWant;
    const [row] = await db
      .update(schema.transactions)
      .set(set)
      .where(and(eq(schema.transactions.id, req.params.id), eq(schema.transactions.userId, req.auth!.userId)))
      .returning();
    if (!row) throw notFound("Transaction");
    return toTransactionDTO(app.ctx, row);
  });

  app.delete("/transactions/:id", { schema: { tags: ["finance"], params: idParam } }, async (req) => {
    const res = await db
      .delete(schema.transactions)
      .where(and(eq(schema.transactions.id, req.params.id), eq(schema.transactions.userId, req.auth!.userId)))
      .returning({ id: schema.transactions.id });
    if (!res.length) throw notFound("Transaction");
    return { ok: true as const };
  });

  /** CSV import — the client parses the file; rows are validated and stored. Negative amounts are treated as expenses. */
  app.post("/transactions/import", { schema: { tags: ["finance"], body: CsvImportSchema } }, async (req) => {
    const userId = req.auth!.userId;
    const values = req.body.rows
      .filter((r) => r.amount !== 0)
      .map((r) => {
        const isIncomeCat = !!r.categoryKey && INCOME_KEYS.has(r.categoryKey);
        const isExpenseCat = !!r.categoryKey && EXPENSE_KEYS.has(r.categoryKey);
        const type: "expense" | "income" = isIncomeCat ? "income" : r.amount < 0 || isExpenseCat ? "expense" : "income";
        const categoryKey = type === "income" ? (isIncomeCat ? r.categoryKey! : "otherIncome") : isExpenseCat ? r.categoryKey! : "other";
        return {
          userId,
          type,
          amount: dec(Math.abs(r.amount)),
          categoryKey,
          date: r.date,
          merchantEnc: cipher.encrypt(r.description),
          needWant: type === "expense" ? suggestNeedWant(categoryKey) : null,
          source: "csv",
        };
      });
    if (values.length) await db.insert(schema.transactions).values(values);
    return { imported: values.length };
  });

  /* ------------------------------ recurring ------------------------------ */

  app.get("/recurring", { schema: { tags: ["finance"] } }, async (req) => (await listRecurring(app.ctx, req.auth!.userId)).map((r) => recurringDTO(app.ctx, r)));

  app.post("/recurring", { schema: { tags: ["finance"], body: RecurringSchema } }, async (req, reply) => {
    const b = req.body;
    await db.insert(schema.recurringTransactions).values({ userId: req.auth!.userId, name: b.name, amount: dec(b.amount), categoryKey: b.categoryKey, dayOfMonth: b.dayOfMonth, active: b.active });
    reply.code(201);
    return (await listRecurring(app.ctx, req.auth!.userId)).map((r) => recurringDTO(app.ctx, r));
  });

  app.patch("/recurring/:id", { schema: { tags: ["finance"], params: idParam, body: RecurringSchema.partial() } }, async (req) => {
    const b = req.body;
    const res = await db
      .update(schema.recurringTransactions)
      .set({ ...(b.name && { name: b.name }), ...(b.amount !== undefined && { amount: dec(b.amount) }), ...(b.categoryKey && { categoryKey: b.categoryKey }), ...(b.dayOfMonth && { dayOfMonth: b.dayOfMonth }), ...(b.active !== undefined && { active: b.active }) })
      .where(and(eq(schema.recurringTransactions.id, req.params.id), eq(schema.recurringTransactions.userId, req.auth!.userId)))
      .returning({ id: schema.recurringTransactions.id });
    if (!res.length) throw notFound("Recurring payment");
    return (await listRecurring(app.ctx, req.auth!.userId)).map((r) => recurringDTO(app.ctx, r));
  });

  app.delete("/recurring/:id", { schema: { tags: ["finance"], params: idParam } }, async (req) => {
    await db.delete(schema.recurringTransactions).where(and(eq(schema.recurringTransactions.id, req.params.id), eq(schema.recurringTransactions.userId, req.auth!.userId)));
    return { ok: true as const };
  });

  /* ------------------------------ budgets ------------------------------ */

  app.get("/budgets/:month", { schema: { tags: ["finance"], params: z.object({ month: MonthKeySchema }) } }, async (req) => getBudget(app.ctx, req.auth!.userId, req.params.month));

  app.put("/budgets/:month", { schema: { tags: ["finance"], params: z.object({ month: MonthKeySchema }), body: BudgetSchema } }, async (req) => {
    const userId = req.auth!.userId;
    const { month } = req.params;
    await db.transaction(async (tx) => {
      const [b] = await tx
        .insert(schema.budgets)
        .values({ userId, month, income: dec(req.body.income) })
        .onConflictDoUpdate({ target: [schema.budgets.userId, schema.budgets.month], set: { income: dec(req.body.income), updatedAt: new Date() } })
        .returning({ id: schema.budgets.id });
      await tx.delete(schema.budgetItems).where(eq(schema.budgetItems.budgetId, b!.id));
      const items = req.body.items.filter((i) => i.planned > 0);
      if (items.length) await tx.insert(schema.budgetItems).values(items.map((i) => ({ budgetId: b!.id, categoryKey: i.categoryKey, planned: dec(i.planned) })));
    });
    await awardBadges(app.ctx, userId);
    return getBudget(app.ctx, userId, month);
  });

  /* ------------------------------ goals ------------------------------ */

  app.get("/goals", { schema: { tags: ["finance"] } }, async (req) => (await listGoals(app.ctx, req.auth!.userId)).map((g) => goalDTO(app.ctx, g)));

  app.post("/goals", { schema: { tags: ["finance"], body: GoalSchema } }, async (req, reply) => {
    const b = req.body;
    const [g] = await db
      .insert(schema.financialGoals)
      .values({ userId: req.auth!.userId, name: b.name, type: b.type, target: dec(b.target), saved: dec(b.saved), deadline: b.deadline ?? null, status: D(b.saved).gte(b.target) ? "completed" : b.status })
      .returning();
    reply.code(201);
    const all = await listGoals(app.ctx, req.auth!.userId);
    return goalDTO(app.ctx, all.find((x) => x.id === g!.id)!);
  });

  app.patch("/goals/:id", { schema: { tags: ["finance"], params: idParam, body: GoalUpdateSchema } }, async (req) => {
    const b = req.body;
    const res = await db
      .update(schema.financialGoals)
      .set({
        ...(b.name && { name: b.name }),
        ...(b.type && { type: b.type }),
        ...(b.target !== undefined && { target: dec(b.target) }),
        ...(b.saved !== undefined && { saved: dec(b.saved) }),
        ...(b.deadline !== undefined && { deadline: b.deadline }),
        ...(b.status && { status: b.status }),
        updatedAt: new Date(),
      })
      .where(and(eq(schema.financialGoals.id, req.params.id), eq(schema.financialGoals.userId, req.auth!.userId)))
      .returning({ id: schema.financialGoals.id });
    if (!res.length) throw notFound("Goal");
    const all = await listGoals(app.ctx, req.auth!.userId);
    return goalDTO(app.ctx, all.find((x) => x.id === req.params.id)!);
  });

  app.delete("/goals/:id", { schema: { tags: ["finance"], params: idParam } }, async (req) => {
    await db.delete(schema.financialGoals).where(and(eq(schema.financialGoals.id, req.params.id), eq(schema.financialGoals.userId, req.auth!.userId)));
    return { ok: true as const };
  });

  app.post("/goals/:id/contributions", { schema: { tags: ["finance"], params: idParam, body: ContributionSchema } }, async (req) => {
    const userId = req.auth!.userId;
    const [goal] = await db.select().from(schema.financialGoals).where(and(eq(schema.financialGoals.id, req.params.id), eq(schema.financialGoals.userId, userId)));
    if (!goal) throw notFound("Goal");
    const newSaved = D(goal.saved).plus(req.body.amount);
    const saved = newSaved.isNegative() ? D(0) : newSaved;
    await db.transaction(async (tx) => {
      await tx.insert(schema.goalContributions).values({ goalId: goal.id, userId, amount: dec(req.body.amount), note: req.body.note ?? null });
      await tx
        .update(schema.financialGoals)
        .set({ saved: saved.toFixed(2), status: saved.gte(goal.target) ? "completed" : goal.status === "completed" ? "active" : goal.status, updatedAt: new Date() })
        .where(eq(schema.financialGoals.id, goal.id));
    });
    await awardBadges(app.ctx, userId);
    const all = await listGoals(app.ctx, userId);
    return goalDTO(app.ctx, all.find((x) => x.id === goal.id)!);
  });

  /* ------------------------------ debts ------------------------------ */

  app.get("/debts", { schema: { tags: ["finance"] } }, async (req) => (await listDebts(app.ctx, req.auth!.userId)).map(debtDTO));

  app.post("/debts", { schema: { tags: ["finance"], body: DebtSchema } }, async (req, reply) => {
    const b = req.body;
    const [d] = await db
      .insert(schema.debts)
      .values({ userId: req.auth!.userId, type: b.type, lenderEnc: cipher.encrypt(b.lender), balance: dec(b.balance), ratePercent: String(b.ratePercent), monthlyPayment: dec(b.monthlyPayment), remainingMonths: b.remainingMonths ?? null, dueDay: b.dueDay ?? null })
      .returning({ id: schema.debts.id });
    reply.code(201);
    return debtDTO((await listDebts(app.ctx, req.auth!.userId)).find((x) => x.id === d!.id)!);
  });

  app.patch("/debts/:id", { schema: { tags: ["finance"], params: idParam, body: DebtUpdateSchema } }, async (req) => {
    const b = req.body;
    const res = await db
      .update(schema.debts)
      .set({
        ...(b.type && { type: b.type }),
        ...(b.lender !== undefined && { lenderEnc: cipher.encrypt(b.lender) }),
        ...(b.balance !== undefined && { balance: dec(b.balance) }),
        ...(b.ratePercent !== undefined && { ratePercent: String(b.ratePercent) }),
        ...(b.monthlyPayment !== undefined && { monthlyPayment: dec(b.monthlyPayment) }),
        ...(b.remainingMonths !== undefined && { remainingMonths: b.remainingMonths }),
        ...(b.dueDay !== undefined && { dueDay: b.dueDay }),
        updatedAt: new Date(),
      })
      .where(and(eq(schema.debts.id, req.params.id), eq(schema.debts.userId, req.auth!.userId)))
      .returning({ id: schema.debts.id });
    if (!res.length) throw notFound("Debt");
    return debtDTO((await listDebts(app.ctx, req.auth!.userId)).find((x) => x.id === req.params.id)!);
  });

  app.delete("/debts/:id", { schema: { tags: ["finance"], params: idParam } }, async (req) => {
    await db.delete(schema.debts).where(and(eq(schema.debts.id, req.params.id), eq(schema.debts.userId, req.auth!.userId)));
    return { ok: true as const };
  });

  app.post("/debts/:id/payments", { schema: { tags: ["finance"], params: idParam, body: z.object({ amount: z.number().positive().max(10_000_000_000), paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }) } }, async (req) => {
    const userId = req.auth!.userId;
    const [debt] = await db.select().from(schema.debts).where(and(eq(schema.debts.id, req.params.id), eq(schema.debts.userId, userId)));
    if (!debt) throw notFound("Debt");
    const next = D(debt.balance).minus(req.body.amount);
    await db.transaction(async (tx) => {
      await tx.insert(schema.debtPayments).values({ debtId: debt.id, userId, amount: dec(req.body.amount), paidAt: req.body.paidAt });
      await tx.update(schema.debts).set({ balance: (next.isNegative() ? D(0) : next).toFixed(2), updatedAt: new Date() }).where(eq(schema.debts.id, debt.id));
    });
    return debtDTO((await listDebts(app.ctx, userId)).find((x) => x.id === debt.id)!);
  });

  app.get(
    "/debts/simulate",
    { schema: { tags: ["finance"], querystring: z.object({ extra: z.coerce.number().min(0).max(100_000_000).default(0) }) } },
    async (req) => {
      const debts = await listDebts(app.ctx, req.auth!.userId);
      const input = debts.map((d) => ({ id: d.id, name: d.lender || d.type, balance: d.balance, annualRatePercent: d.ratePercent, minimumPayment: d.monthlyPayment }));
      const extra = req.query.extra;
      return {
        snowball: simulateDebtStrategy(input, extra, "snowball"),
        avalanche: simulateDebtStrategy(input, extra, "avalanche"),
        perDebt: debts.map((d) => ({ id: d.id, ...simulateExtraPayment(d.balance, d.ratePercent, d.monthlyPayment, extra, app.ctx.now()) })),
      };
    },
  );

  /* ------------------------------ monthly report ------------------------------ */

  app.get("/reports/monthly", { schema: { tags: ["finance"], querystring: z.object({ month: MonthKeySchema.optional() }) } }, async (req) => {
    const userId = req.auth!.userId;
    const now = app.ctx.now();
    const month = req.query.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [y, m] = month.split("-").map(Number) as [number, number];
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
    const sums = await db
      .select({
        month: sql<string>`to_char(${schema.transactions.date}, 'YYYY-MM')`,
        type: schema.transactions.type,
        categoryKey: schema.transactions.categoryKey,
        total: sql<string>`sum(${schema.transactions.amount})`,
      })
      .from(schema.transactions)
      .where(and(eq(schema.transactions.userId, userId), sql`to_char(${schema.transactions.date}, 'YYYY-MM') in (${month}, ${prev})`))
      .groupBy(sql`1`, schema.transactions.type, schema.transactions.categoryKey);
    const total = (mo: string, type: string, filter: (k: string) => boolean = () => true) => sums.filter((s) => s.month === mo && s.type === type && filter(s.categoryKey)).reduce((a, s) => a.plus(s.total), D(0));
    const notSaving = (k: string) => k !== "savings" && k !== "investments";
    const income = total(month, "income");
    const expenses = total(month, "expense", notSaving);
    const prevExpenses = total(prev, "expense", notSaving);
    const prevIncome = total(prev, "income");
    const savings = income.minus(expenses);
    const prevSavings = prevIncome.minus(prevExpenses);
    const cats = sums.filter((s) => s.month === month && s.type === "expense" && notSaving(s.categoryKey)).sort((a, b) => num(b.total) - num(a.total));
    const budget = await getBudget(app.ctx, userId, month);
    let budgetAccuracy: number | null = null;
    if (budget?.items.length) {
      const within = budget.items.filter((i) => num(cats.find((c) => c.categoryKey === i.categoryKey)?.total) <= i.planned).length;
      budgetAccuracy = Math.round((within / budget.items.length) * 100);
    }
    const scores = await db.select().from(schema.financialHealthScores).where(and(eq(schema.financialHealthScores.userId, userId), sql`${schema.financialHealthScores.month} in (${month}, ${prev})`));
    const lessons = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(schema.learningProgress)
      .where(and(eq(schema.learningProgress.userId, userId), sql`to_char(${schema.learningProgress.completedAt} at time zone 'Asia/Colombo', 'YYYY-MM') = ${month}`));
    const badges = await db
      .select()
      .from(schema.userAchievements)
      .where(and(eq(schema.userAchievements.userId, userId), sql`to_char(${schema.userAchievements.earnedAt} at time zone 'Asia/Colombo', 'YYYY-MM') = ${month}`));
    const goals = await listGoals(app.ctx, userId, month);
    return {
      month,
      income: income.toNumber(),
      expenses: expenses.toNumber(),
      savings: savings.toNumber(),
      savingsRate: income.gt(0) ? Math.round(savings.div(income).times(1000).toNumber()) / 10 : 0,
      savingsVsLast: savings.minus(prevSavings).toNumber(),
      largestCategory: cats[0] ? { categoryKey: cats[0].categoryKey, total: num(cats[0].total) } : null,
      budgetAccuracy,
      goalContributions: goals.reduce((a, g) => a + g.contributedThisMonth, 0),
      healthScore: scores.find((s) => s.month === month)?.score ?? null,
      healthScorePrev: scores.find((s) => s.month === prev)?.score ?? null,
      lessonsCompleted: lessons[0]?.c ?? 0,
      badges: badges.map((b) => b.badgeKey),
    };
  });
};
