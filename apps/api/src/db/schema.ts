import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, integer, boolean, numeric, date, jsonb, char, primaryKey, index, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * PostgreSQL schema for සකසුරු.
 * Money columns are NUMERIC(14,2) — never floating point.
 * Free-text financial details (merchant, notes, lender, AI messages,
 * profile amounts) are encrypted at the application layer (AES-256-GCM)
 * and stored in *_enc columns.
 */

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
const money = (name: string) => numeric(name, { precision: 14, scale: 2 });
const userRef = () =>
  uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });

/* ---------------------------- identity ---------------------------- */

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  failedLogins: integer("failed_logins").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  language: text("language").notNull().default("si"),
  ageRange: text("age_range"),
  employment: text("employment"),
  helpWith: jsonb("help_with").$type<string[]>().notNull().default([]),
  incomeRange: text("income_range"),
  monthlyIncomeEnc: text("monthly_income_enc"),
  monthlyExpensesEnc: text("monthly_expenses_enc"),
  currentSavingsEnc: text("current_savings_enc"),
  monthlyDebtEnc: text("monthly_debt_enc"),
  primaryGoal: text("primary_goal"),
  mode: text("mode").notNull().default("standard"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  updatedAt: updatedAt(),
});

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: updatedAt(),
});

/** Append-only consent log; the latest row per type is the current state. */
export const consents = pgTable(
  "consents",
  {
    id: id(),
    userId: userRef(),
    type: text("type").notNull(), // terms | aiDataAccess | aiHistory | analytics
    granted: boolean("granted").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("consents_user_type_idx").on(t.userId, t.type, t.createdAt)],
);

/** Refresh-token sessions with rotation and reuse detection (family_id). */
export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: userRef(),
    tokenHash: text("token_hash").notNull().unique(),
    familyId: uuid("family_id").notNull(),
    userAgent: text("user_agent"),
    ip: text("ip"),
    createdAt: createdAt(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [index("sessions_user_idx").on(t.userId), index("sessions_family_idx").on(t.familyId)],
);

/* ---------------------------- money ---------------------------- */

export const recurringTransactions = pgTable("recurring_transactions", {
  id: id(),
  userId: userRef(),
  name: text("name").notNull(),
  amount: money("amount").notNull(),
  categoryKey: text("category_key").notNull(),
  dayOfMonth: integer("day_of_month").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const transactions = pgTable(
  "transactions",
  {
    id: id(),
    userId: userRef(),
    type: text("type").notNull(), // expense | income
    amount: money("amount").notNull(),
    categoryKey: text("category_key").notNull(),
    date: date("date").notNull(),
    merchantEnc: text("merchant_enc"),
    method: text("method"),
    notesEnc: text("notes_enc"),
    needWant: text("need_want"),
    recurringId: uuid("recurring_id").references(() => recurringTransactions.id, { onDelete: "set null" }),
    source: text("source").notNull().default("manual"), // manual | csv
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("transactions_user_date_idx").on(t.userId, t.date)],
);

export const budgets = pgTable(
  "budgets",
  {
    id: id(),
    userId: userRef(),
    month: char("month", { length: 7 }).notNull(),
    income: money("income").notNull().default("0"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("budgets_user_month_uq").on(t.userId, t.month)],
);

export const budgetItems = pgTable("budget_items", {
  id: id(),
  budgetId: uuid("budget_id")
    .notNull()
    .references(() => budgets.id, { onDelete: "cascade" }),
  categoryKey: text("category_key").notNull(),
  planned: money("planned").notNull(),
});

export const financialGoals = pgTable("financial_goals", {
  id: id(),
  userId: userRef(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  target: money("target").notNull(),
  saved: money("saved").notNull().default("0"),
  deadline: date("deadline"),
  status: text("status").notNull().default("active"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const goalContributions = pgTable("goal_contributions", {
  id: id(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => financialGoals.id, { onDelete: "cascade" }),
  userId: userRef(),
  amount: money("amount").notNull(),
  note: text("note"),
  createdAt: createdAt(),
});

export const debts = pgTable("debts", {
  id: id(),
  userId: userRef(),
  type: text("type").notNull(),
  lenderEnc: text("lender_enc"),
  balance: money("balance").notNull(),
  ratePercent: numeric("rate_percent", { precision: 6, scale: 3 }).notNull(),
  monthlyPayment: money("monthly_payment").notNull(),
  remainingMonths: integer("remaining_months"),
  dueDay: integer("due_day"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const debtPayments = pgTable("debt_payments", {
  id: id(),
  debtId: uuid("debt_id")
    .notNull()
    .references(() => debts.id, { onDelete: "cascade" }),
  userId: userRef(),
  amount: money("amount").notNull(),
  paidAt: date("paid_at").notNull(),
  createdAt: createdAt(),
});

export const financialHealthScores = pgTable(
  "financial_health_scores",
  {
    id: id(),
    userId: userRef(),
    month: char("month", { length: 7 }).notNull(),
    score: integer("score").notNull(),
    factors: jsonb("factors").notNull(),
    version: text("version").notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("health_user_month_uq").on(t.userId, t.month)],
);

/* ---------------------------- learning ---------------------------- */

export const courses = pgTable("courses", {
  slug: text("slug").primaryKey(),
  level: integer("level").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  title: jsonb("title").notNull(),
  description: jsonb("description").notNull(),
  prerequisites: jsonb("prerequisites").$type<string[]>().notNull().default([]),
});

/**
 * Lessons store trilingual content (title, cards, quiz…) as JSONB so
 * administrators can edit them through the CMS without code changes.
 */
export const lessons = pgTable(
  "lessons",
  {
    slug: text("slug").primaryKey(),
    courseSlug: text("course_slug")
      .notNull()
      .references(() => courses.slug, { onDelete: "cascade" }),
    sort: integer("sort").notNull().default(0),
    data: jsonb("data").notNull(),
    status: text("status").notNull().default("draft"),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
    lastReviewed: date("last_reviewed").notNull(),
    nextReview: date("next_review").notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [index("lessons_course_idx").on(t.courseSlug, t.sort)],
);

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: id(),
    userId: userRef(),
    lessonSlug: text("lesson_slug").notNull(),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    answers: jsonb("answers").notNull(),
    xpEarned: integer("xp_earned").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("quiz_attempts_user_idx").on(t.userId, t.lessonSlug)],
);

export const learningProgress = pgTable(
  "learning_progress",
  {
    userId: userRef(),
    lessonSlug: text("lesson_slug").notNull(),
    bestScore: integer("best_score").notNull(),
    total: integer("total").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonSlug] })],
);

export const learningStreaks = pgTable("learning_streaks", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: userRef(),
    badgeKey: text("badge_key").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeKey] })],
);

export const challengeParticipation = pgTable(
  "challenge_participation",
  {
    userId: userRef(),
    challengeKey: text("challenge_key").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.challengeKey] })],
);

/* ---------------------------- engagement & safety ---------------------------- */

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: userRef(),
    key: text("key").notNull(),
    params: jsonb("params").$type<Record<string, string | number>>().notNull().default({}),
    dedupeKey: text("dedupe_key").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("notifications_dedupe_uq").on(t.userId, t.dedupeKey)],
);

export const aiConversations = pgTable("ai_conversations", {
  id: id(),
  userId: userRef(),
  createdAt: createdAt(),
});

export const aiMessages = pgTable("ai_messages", {
  id: id(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  contentEnc: text("content_enc").notNull(),
  mode: text("mode"),
  sources: jsonb("sources"),
  createdAt: createdAt(),
});

/** Anonymous topic counters for admin analytics — no user id, no question text. */
export const aiTopicStats = pgTable("ai_topic_stats", {
  topic: text("topic").primaryKey(),
  count: integer("count").notNull().default(0),
});

export const scamAlerts = pgTable("scam_alerts", {
  id: id(),
  title: jsonb("title").notNull(),
  body: jsonb("body").notNull(),
  status: text("status").notNull().default("draft"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    target: text("target"),
    ip: text("ip"),
    meta: jsonb("meta"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);
