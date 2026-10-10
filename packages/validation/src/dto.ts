import type { HealthScoreResult, Insight, BudgetProgress, NeedsWantsSplit, CategoryTotal, ScamCheckResult } from "@sakasuru/financial-engine";
import type { Lesson, SourceRef } from "@sakasuru/content";

/* Response shapes shared by the API and the web client. */

export type Lang = "si" | "ta" | "en";
export type RoleName = "user" | "creator" | "reviewer" | "moderator" | "admin" | "superadmin";

export interface UserDTO {
  id: string;
  email: string;
  role: RoleName;
  createdAt: string;
}

export interface ProfileDTO {
  name: string;
  language: Lang;
  ageRange: string | null;
  employment: string | null;
  helpWith: string[];
  incomeRange: string | null;
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  currentSavings: number | null;
  monthlyDebt: number | null;
  primaryGoal: string | null;
  mode: "standard" | "student" | "family" | "business";
  onboardingCompleted: boolean;
}

export interface MeDTO {
  user: UserDTO;
  profile: ProfileDTO;
  preferences: import("./index.js").Preferences;
  consents: import("./index.js").Consents;
}

export interface TransactionDTO {
  id: string;
  type: "expense" | "income";
  amount: number;
  categoryKey: string;
  date: string;
  merchant: string | null;
  method: string | null;
  notes: string | null;
  needWant: "need" | "want" | "saving" | null;
  recurringId: string | null;
  createdAt: string;
}

export interface RecurringDTO {
  id: string;
  name: string;
  amount: number;
  categoryKey: string;
  dayOfMonth: number;
  active: boolean;
  nextDue: string;
}

export interface BudgetDTO {
  month: string;
  income: number;
  items: { categoryKey: string; planned: number }[];
}

export interface GoalDTO {
  id: string;
  name: string;
  type: string;
  target: number;
  saved: number;
  deadline: string | null;
  status: "active" | "paused" | "archived" | "completed";
  monthlyRequired: number;
  progressPercent: number;
  monthsLeft: number;
  createdAt: string;
}

export interface DebtDTO {
  id: string;
  type: string;
  lender: string | null;
  balance: number;
  ratePercent: number;
  monthlyPayment: number;
  remainingMonths: number | null;
  dueDay: number | null;
  payoffMonths: number | null;
  totalInterest: number;
}

export interface DashboardDTO {
  month: string;
  income: number;
  spent: number;
  saved: number;
  remaining: number;
  byGroup: CategoryTotal[];
  byCategory: CategoryTotal[];
  needsWants: NeedsWantsSplit;
  budget: { planned: number; spent: number; progress: BudgetProgress[] } | null;
  health: HealthScoreResult;
  healthChange: number | null;
  insights: Insight[];
  recent: TransactionDTO[];
  upcomingBills: (RecurringDTO & { daysUntil: number })[];
  goals: GoalDTO[];
  essentialMonthly: number;
  emergencyFund: number;
  debtTotals: { total: number; monthly: number; dti: number };
}

export interface HealthHistoryPoint {
  month: string;
  score: number;
}

export interface CourseSummaryDTO {
  slug: string;
  level: number;
  icon: string;
  color: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  prerequisites: string[];
  lessons: { slug: string; title: Record<Lang, string>; summary: Record<Lang, string>; minutes: number; xp: number; protection: boolean; timeSensitive: boolean }[];
}

export type LessonDTO = Lesson & { courseSlug: string; status: string };

export interface LearningStateDTO {
  xp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  completed: Record<string, { score: number; total: number; completedAt: string }>;
  badges: { key: string; earnedAt: string }[];
  challenges: { key: string; joinedAt: string; progress: number; completed: boolean }[];
}

export interface LessonCompleteResultDTO {
  correct: number;
  total: number;
  xpEarned: number;
  newBadges: string[];
  results: Record<string, { correct: boolean; correctId: string }>;
  learning: LearningStateDTO;
}

export interface NotificationDTO {
  id: string;
  key: string;
  params: Record<string, string | number>;
  read: boolean;
  createdAt: string;
}

export interface AiAnswerDTO {
  answer: string;
  mode: "knowledge" | "personal" | "llm" | "low-confidence";
  sources: (SourceRef & { lastReviewed?: string })[];
  usedFields: string[];
  relatedLesson: string | null;
  actions: ("analyse" | "learnBudget" | "createBudget")[];
}

export interface ScamCheckDTO extends ScamCheckResult {}

export interface SessionDTO {
  id: string;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
}

export interface AdminStatsDTO {
  users: number;
  activeUsers30d: number;
  lessonsCompleted: number;
  quizSuccessRate: number;
  budgets: number;
  goals: number;
  languages: { lang: Lang; count: number }[];
  hardestLessons: { slug: string; avgScore: number; attempts: number }[];
  topAiTopics: { topic: string; count: number }[];
  signupsByDay: { day: string; count: number }[];
}

export interface AdminLessonDTO {
  slug: string;
  courseSlug: string;
  title: Record<Lang, string>;
  status: "draft" | "review" | "approved" | "published" | "archived";
  author: string | null;
  reviewer: string | null;
  lastReviewed: string;
  nextReview: string;
  timeSensitive: boolean;
  updatedAt: string;
}

export interface AuditLogDTO {
  id: string;
  actor: string | null;
  action: string;
  target: string | null;
  createdAt: string;
  ip: string | null;
}
