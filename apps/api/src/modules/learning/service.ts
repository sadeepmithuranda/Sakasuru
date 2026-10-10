import { and, asc, eq, sql } from "drizzle-orm";
import { evaluateBadges, badgeXp, levelForXp, CHALLENGES, colomboDate, type Lesson, type Course } from "@sakasuru/content";
import type { CourseSummaryDTO, LearningStateDTO, LessonDTO } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import type { AppContext } from "../../lib/context.js";
import { num } from "../../lib/money.js";

type LessonData = Omit<Lesson, "slug" | "lastReviewed" | "nextReview">;

export async function listCourses(ctx: AppContext, opts: { includeUnpublished?: boolean } = {}): Promise<CourseSummaryDTO[]> {
  const courses = await ctx.db.select().from(schema.courses).orderBy(asc(schema.courses.level));
  const lessons = await ctx.db.select().from(schema.lessons).orderBy(asc(schema.lessons.sort));
  return courses.map((c) => ({
    slug: c.slug,
    level: c.level,
    icon: c.icon,
    color: c.color,
    title: c.title as CourseSummaryDTO["title"],
    description: c.description as CourseSummaryDTO["description"],
    prerequisites: c.prerequisites,
    lessons: lessons
      .filter((l) => l.courseSlug === c.slug && (opts.includeUnpublished || l.status === "published"))
      .map((l) => {
        const d = l.data as LessonData;
        return { slug: l.slug, title: d.title, summary: d.summary, minutes: d.minutes, xp: d.xp, protection: !!d.protection, timeSensitive: !!d.timeSensitive };
      }),
  }));
}

export async function getLesson(ctx: AppContext, slug: string, opts: { includeUnpublished?: boolean } = {}): Promise<LessonDTO | null> {
  const [row] = await ctx.db.select().from(schema.lessons).where(eq(schema.lessons.slug, slug));
  if (!row || (!opts.includeUnpublished && row.status !== "published")) return null;
  const d = row.data as LessonData;
  return { ...d, slug: row.slug, courseSlug: row.courseSlug, status: row.status, lastReviewed: row.lastReviewed, nextReview: row.nextReview };
}

async function ensureStreakRow(ctx: AppContext, userId: string) {
  await ctx.db.insert(schema.learningStreaks).values({ userId }).onConflictDoNothing();
  const [s] = await ctx.db.select().from(schema.learningStreaks).where(eq(schema.learningStreaks.userId, userId));
  return s!;
}

export async function getLearningState(ctx: AppContext, userId: string): Promise<LearningStateDTO> {
  const [s, progress, badges, challenges, metrics] = await Promise.all([
    ensureStreakRow(ctx, userId),
    ctx.db.select().from(schema.learningProgress).where(eq(schema.learningProgress.userId, userId)),
    ctx.db.select().from(schema.userAchievements).where(eq(schema.userAchievements.userId, userId)),
    ctx.db.select().from(schema.challengeParticipation).where(eq(schema.challengeParticipation.userId, userId)),
    challengeMetrics(ctx, userId),
  ]);
  // A streak only counts if the last activity was today or yesterday (Colombo time).
  const today = colomboDate(ctx.now());
  const yesterday = colomboDate(new Date(ctx.now().getTime() - 86_400_000));
  const streak = s.lastActiveDate === today || s.lastActiveDate === yesterday ? s.streak : 0;
  const lvl = levelForXp(s.xp);
  return {
    xp: s.xp,
    level: lvl.level,
    currentLevelXp: lvl.currentLevelXp,
    nextLevelXp: lvl.nextLevelXp,
    streak,
    longestStreak: s.longestStreak,
    lastActiveDate: s.lastActiveDate,
    completed: Object.fromEntries(progress.map((p) => [p.lessonSlug, { score: p.bestScore, total: p.total, completedAt: p.completedAt.toISOString() }])),
    badges: badges.map((b) => ({ key: b.badgeKey, earnedAt: b.earnedAt.toISOString() })),
    challenges: challenges.map((c) => {
      const def = CHALLENGES.find((d) => d.key === c.challengeKey);
      const since = c.joinedAt;
      const m = metrics(since);
      const progress = def ? Math.min(m[def.metric], def.target) : 0;
      return { key: c.challengeKey, joinedAt: c.joinedAt.toISOString(), progress, completed: !!c.completedAt || (def ? progress >= def.target : false) };
    }),
  };
}

/** Metrics for weekly challenges, measured from the date the user joined. */
async function challengeMetrics(ctx: AppContext, userId: string) {
  const [tx, attempts, contributions, efund] = await Promise.all([
    ctx.db
      .select({ date: schema.transactions.date, createdAt: schema.transactions.createdAt, needWant: schema.transactions.needWant, type: schema.transactions.type })
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, userId)),
    ctx.db.select({ slug: schema.learningProgress.lessonSlug, at: schema.learningProgress.completedAt }).from(schema.learningProgress).where(eq(schema.learningProgress.userId, userId)),
    ctx.db.select({ amount: schema.goalContributions.amount, at: schema.goalContributions.createdAt, goalId: schema.goalContributions.goalId }).from(schema.goalContributions).where(eq(schema.goalContributions.userId, userId)),
    ctx.db.select({ id: schema.financialGoals.id }).from(schema.financialGoals).where(and(eq(schema.financialGoals.userId, userId), eq(schema.financialGoals.type, "emergency"))),
  ]);
  const efundIds = new Set(efund.map((g) => g.id));
  return (since: Date) => {
    const sinceIso = colomboDate(since);
    const expenses = tx.filter((t) => t.type === "expense" && t.date >= sinceIso);
    const days = new Set(expenses.map((t) => t.date));
    const wantDays = new Set(expenses.filter((t) => t.needWant === "want").map((t) => t.date));
    const noSpend = [...days].filter((d) => !wantDays.has(d) && d < colomboDate(ctx.now())).length;
    const recent = contributions.filter((c) => c.at >= since && num(c.amount) > 0);
    return {
      expenseDays: days.size,
      lessons: attempts.filter((a) => a.at >= since).length,
      savedAmount: recent.reduce((a, c) => a + num(c.amount), 0),
      noSpendDays: noSpend,
      subscriptionReview: 0,
      emergencyContribution: recent.filter((c) => efundIds.has(c.goalId)).length,
    };
  };
}

/** Evaluate and grant badges; returns newly earned keys. Badges never reward borrowing or trading. */
export async function awardBadges(ctx: AppContext, userId: string, extra: { perfectQuiz?: boolean } = {}): Promise<string[]> {
  const db = ctx.db;
  const [expenseCount, budgetCount, progress, earned, streakRow, efundContrib, monthly, courses] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(schema.transactions).where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.type, "expense"))),
    db.select({ c: sql<number>`count(*)::int` }).from(schema.budgets).where(eq(schema.budgets.userId, userId)),
    db.select({ slug: schema.learningProgress.lessonSlug }).from(schema.learningProgress).where(eq(schema.learningProgress.userId, userId)),
    db.select({ key: schema.userAchievements.badgeKey }).from(schema.userAchievements).where(eq(schema.userAchievements.userId, userId)),
    ensureStreakRow(ctx, userId),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(schema.goalContributions)
      .innerJoin(schema.financialGoals, eq(schema.goalContributions.goalId, schema.financialGoals.id))
      .where(and(eq(schema.goalContributions.userId, userId), eq(schema.financialGoals.type, "emergency"), sql`${schema.goalContributions.amount} > 0`)),
    db
      .select({
        month: sql<string>`to_char(${schema.transactions.date}, 'YYYY-MM')`,
        income: sql<string>`sum(case when ${schema.transactions.type} = 'income' then ${schema.transactions.amount} else 0 end)`,
        expense: sql<string>`sum(case when ${schema.transactions.type} = 'expense' and ${schema.transactions.categoryKey} not in ('savings','investments') then ${schema.transactions.amount} else 0 end)`,
      })
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, userId))
      .groupBy(sql`1`),
    listCourses(ctx),
  ]);
  const bestRate = Math.max(0, ...monthly.filter((m) => num(m.income) > 0).map((m) => ((num(m.income) - num(m.expense)) / num(m.income)) * 100));
  const lessonsOf = (pred: (c: Course | CourseSummaryDTO) => boolean, lessonPred: (l: CourseSummaryDTO["lessons"][number]) => boolean = () => true) =>
    courses.filter(pred).flatMap((c) => c.lessons.filter(lessonPred).map((l) => l.slug));

  // Budget Master: last complete month had a budget and every category stayed within it.
  const now = ctx.now();
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastKey = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}`;
  let budgetAllWithin = false;
  const [lb] = await db.select().from(schema.budgets).where(and(eq(schema.budgets.userId, userId), eq(schema.budgets.month, lastKey)));
  if (lb) {
    const items = await db.select().from(schema.budgetItems).where(eq(schema.budgetItems.budgetId, lb.id));
    const spent = await db
      .select({ k: schema.transactions.categoryKey, t: sql<string>`sum(${schema.transactions.amount})` })
      .from(schema.transactions)
      .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.type, "expense"), sql`to_char(${schema.transactions.date}, 'YYYY-MM') = ${lastKey}`))
      .groupBy(schema.transactions.categoryKey);
    budgetAllWithin = items.length > 0 && spent.length > 0 && items.every((i) => num(spent.find((s) => s.k === i.categoryKey)?.t) <= num(i.planned));
  }

  const newKeys = evaluateBadges(
    {
      expenseCount: expenseCount[0]?.c ?? 0,
      budgetCount: budgetCount[0]?.c ?? 0,
      bestMonthSavingRate: bestRate,
      lessonsCompleted: progress.map((p) => p.slug),
      protectionLessons: lessonsOf(() => true, (l) => l.protection),
      investingLessons: lessonsOf((c) => c.slug === "saving-investing"),
      streak: streakRow.streak,
      budgetAllWithinLastMonth: budgetAllWithin,
      emergencyContributed: (efundContrib[0]?.c ?? 0) > 0,
      perfectQuiz: !!extra.perfectQuiz,
    },
    earned.map((e) => e.key),
  );
  if (newKeys.length) {
    await db.insert(schema.userAchievements).values(newKeys.map((badgeKey) => ({ userId, badgeKey }))).onConflictDoNothing();
    const xp = newKeys.reduce((a, k) => a + badgeXp(k), 0);
    await db.update(schema.learningStreaks).set({ xp: sql`${schema.learningStreaks.xp} + ${xp}` }).where(eq(schema.learningStreaks.userId, userId));
    await db
      .insert(schema.notifications)
      .values(newKeys.map((k) => ({ userId, key: "notifications.badge", params: { badge: k }, dedupeKey: `badge:${k}` })))
      .onConflictDoNothing();
  }
  return newKeys;
}
