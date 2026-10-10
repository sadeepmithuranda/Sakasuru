import { desc, eq } from "drizzle-orm";
import { colomboDate } from "@sakasuru/content";
import type { NotificationDTO } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import type { AppContext } from "../../lib/context.js";
import { buildDashboard } from "../finance/service.js";
import { getPreferences } from "../me/service.js";

/**
 * Generates meaningful, de-duplicated notifications (bills due, budget
 * thresholds, nearly-reached goals, streak reminders) according to the
 * user's preferences. Each notification is keyed so it is created once.
 */
export async function generateNotifications(ctx: AppContext, userId: string) {
  const prefs = await getPreferences(ctx, userId);
  const d = await buildDashboard(ctx, userId);
  const rows: { key: string; params: Record<string, string | number>; dedupeKey: string }[] = [];

  if (prefs.notifyBills)
    for (const b of d.upcomingBills.filter((b) => b.daysUntil <= 3))
      rows.push({ key: "notifications.billDue", params: { name: b.name, n: b.daysUntil }, dedupeKey: `bill:${b.id}:${b.nextDue}` });

  if (prefs.notifyBudget && d.budget)
    for (const p of d.budget.progress.filter((p) => p.percentUsed >= 80))
      rows.push({ key: "notifications.budgetNear", params: { category: p.categoryKey, percent: Math.min(Math.round(p.percentUsed), 999) }, dedupeKey: `budget:${d.month}:${p.categoryKey}:${p.percentUsed >= 100 ? 100 : 80}` });

  if (prefs.notifyGoals)
    for (const g of d.goals.filter((g) => g.status === "active" && g.target - g.saved > 0 && g.target - g.saved <= 5000))
      rows.push({ key: "notifications.goalClose", params: { amount: Math.round(g.target - g.saved), goal: g.name }, dedupeKey: `goal:${g.id}:close` });

  if (prefs.notifyLearning) {
    const [s] = await ctx.db.select().from(schema.learningStreaks).where(eq(schema.learningStreaks.userId, userId));
    const yesterday = colomboDate(new Date(ctx.now().getTime() - 86_400_000));
    if (s && s.streak >= 2 && s.lastActiveDate === yesterday) rows.push({ key: "notifications.streak", params: { n: s.streak }, dedupeKey: `streak:${colomboDate(ctx.now())}` });
  }

  if (rows.length) await ctx.db.insert(schema.notifications).values(rows.map((r) => ({ ...r, userId }))).onConflictDoNothing();
}

export async function listNotifications(ctx: AppContext, userId: string): Promise<NotificationDTO[]> {
  const rows = await ctx.db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)).orderBy(desc(schema.notifications.createdAt)).limit(50);
  return rows.map((n) => ({ id: n.id, key: n.key, params: n.params, read: !!n.readAt, createdAt: n.createdAt.toISOString() }));
}
