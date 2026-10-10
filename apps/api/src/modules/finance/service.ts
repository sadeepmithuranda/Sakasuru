import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { computeDashboard, enrichDebt, enrichGoal, enrichRecurring, monthKeyOf, type TxRecord } from "@sakasuru/financial-engine";
import { PROTECTION_LESSONS } from "@sakasuru/content";
import type { DashboardDTO, DebtDTO, GoalDTO, RecurringDTO, TransactionDTO } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import type { AppContext } from "../../lib/context.js";
import { num, numOrNull } from "../../lib/money.js";
import { getProfile } from "../me/service.js";

type TxRow = typeof schema.transactions.$inferSelect;

export function toTransactionDTO(ctx: AppContext, t: TxRow): TransactionDTO {
  return {
    id: t.id,
    type: t.type as TransactionDTO["type"],
    amount: num(t.amount),
    categoryKey: t.categoryKey,
    date: t.date,
    merchant: ctx.cipher.decrypt(t.merchantEnc),
    method: t.method,
    notes: ctx.cipher.decrypt(t.notesEnc),
    needWant: (t.needWant as TransactionDTO["needWant"]) ?? null,
    recurringId: t.recurringId,
    createdAt: t.createdAt.toISOString(),
  };
}

export async function listGoals(ctx: AppContext, userId: string, month?: string) {
  const rows = await ctx.db.select().from(schema.financialGoals).where(eq(schema.financialGoals.userId, userId)).orderBy(schema.financialGoals.createdAt);
  const m = month ?? monthKeyOf(ctx.now());
  const contributions = await ctx.db
    .select({ goalId: schema.goalContributions.goalId, total: sql<string>`coalesce(sum(${schema.goalContributions.amount}),0)` })
    .from(schema.goalContributions)
    .where(and(eq(schema.goalContributions.userId, userId), sql`to_char(${schema.goalContributions.createdAt} at time zone 'Asia/Colombo','YYYY-MM') = ${m}`))
    .groupBy(schema.goalContributions.goalId);
  const byGoal = new Map(contributions.map((c) => [c.goalId, num(c.total)]));
  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    type: g.type,
    target: num(g.target),
    saved: num(g.saved),
    deadline: g.deadline,
    status: g.status as GoalDTO["status"],
    createdAt: g.createdAt.toISOString(),
    contributedThisMonth: byGoal.get(g.id) ?? 0,
  }));
}

export const goalDTO = (ctx: AppContext, g: Awaited<ReturnType<typeof listGoals>>[number]): GoalDTO => enrichGoal(g, ctx.now());

export async function listDebts(ctx: AppContext, userId: string) {
  const rows = await ctx.db.select().from(schema.debts).where(eq(schema.debts.userId, userId)).orderBy(schema.debts.createdAt);
  return rows.map((d) => ({
    id: d.id,
    type: d.type,
    lender: ctx.cipher.decrypt(d.lenderEnc),
    balance: num(d.balance),
    ratePercent: num(d.ratePercent),
    monthlyPayment: num(d.monthlyPayment),
    remainingMonths: d.remainingMonths,
    dueDay: d.dueDay,
  }));
}

export const debtDTO = (d: Awaited<ReturnType<typeof listDebts>>[number]): DebtDTO => enrichDebt(d);

export async function listRecurring(ctx: AppContext, userId: string) {
  const rows = await ctx.db.select().from(schema.recurringTransactions).where(eq(schema.recurringTransactions.userId, userId)).orderBy(schema.recurringTransactions.dayOfMonth);
  return rows.map((r) => ({ id: r.id, name: r.name, amount: num(r.amount), categoryKey: r.categoryKey, dayOfMonth: r.dayOfMonth, active: r.active }));
}

export const recurringDTO = (ctx: AppContext, r: Awaited<ReturnType<typeof listRecurring>>[number]): RecurringDTO => {
  const { daysUntil: _d, ...rest } = enrichRecurring(r, ctx.now());
  return rest;
};

export async function getBudget(ctx: AppContext, userId: string, month: string) {
  const [b] = await ctx.db.select().from(schema.budgets).where(and(eq(schema.budgets.userId, userId), eq(schema.budgets.month, month)));
  if (!b) return null;
  const items = await ctx.db.select().from(schema.budgetItems).where(eq(schema.budgetItems.budgetId, b.id));
  return { month, income: num(b.income), items: items.map((i) => ({ categoryKey: i.categoryKey, planned: num(i.planned) })) };
}

/** Assemble the dashboard via the shared domain service and persist the month's health snapshot. */
export async function buildDashboard(ctx: AppContext, userId: string): Promise<DashboardDTO> {
  const today = ctx.now();
  const month = monthKeyOf(today);
  const from = new Date(today.getFullYear(), today.getMonth() - 12, 1);
  const fromIso = `${monthKeyOf(from)}-01`;
  const [txRows, budget, goals, debts, recurring, profile, progress, prevScoreRow] = await Promise.all([
    ctx.db.select().from(schema.transactions).where(and(eq(schema.transactions.userId, userId), gte(schema.transactions.date, fromIso))).orderBy(desc(schema.transactions.date)),
    getBudget(ctx, userId, month),
    listGoals(ctx, userId, month),
    listDebts(ctx, userId),
    listRecurring(ctx, userId),
    getProfile(ctx, userId),
    ctx.db.select({ slug: schema.learningProgress.lessonSlug }).from(schema.learningProgress).where(eq(schema.learningProgress.userId, userId)),
    ctx.db
      .select()
      .from(schema.financialHealthScores)
      .where(and(eq(schema.financialHealthScores.userId, userId), sql`${schema.financialHealthScores.month} < ${month}`))
      .orderBy(desc(schema.financialHealthScores.month))
      .limit(1),
  ]);
  const txDtos = txRows.map((t) => toTransactionDTO(ctx, t));
  const records: TxRecord[] = txDtos.map((t) => ({ ...t }));
  const done = progress.map((p) => p.slug);
  const d = computeDashboard({
    today,
    transactions: records,
    budget,
    goals,
    debts,
    recurring,
    profile,
    lessonsCompleted: done.length,
    protectionLessonsCompleted: done.filter((s) => PROTECTION_LESSONS.includes(s)).length,
    previousScore: prevScoreRow[0]?.score ?? null,
  });

  await ctx.db
    .insert(schema.financialHealthScores)
    .values({ userId, month, score: d.health.score, factors: d.health.factors, version: d.health.version })
    .onConflictDoUpdate({
      target: [schema.financialHealthScores.userId, schema.financialHealthScores.month],
      set: { score: d.health.score, factors: d.health.factors, version: d.health.version, updatedAt: new Date() },
    });

  const byId = new Map(txDtos.map((t) => [t.id, t]));
  return {
    ...d,
    recent: d.recent.map((r) => byId.get(r.id)!).filter(Boolean),
    upcomingBills: d.upcomingBills,
  };
}

export async function transactionsInRange(ctx: AppContext, userId: string, from?: string, to?: string) {
  const conds = [eq(schema.transactions.userId, userId)];
  if (from) conds.push(gte(schema.transactions.date, from));
  if (to) conds.push(lte(schema.transactions.date, to));
  return ctx.db.select().from(schema.transactions).where(and(...conds)).orderBy(desc(schema.transactions.date), desc(schema.transactions.createdAt));
}

export { numOrNull };
