import { z } from "zod";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "@sakasuru/financial-engine";

/* Shared request schemas — used by the API for validation and by the web app for forms. */

export const LangSchema = z.enum(["si", "ta", "en"]);
export const RoleSchema = z.enum(["user", "creator", "reviewer", "moderator", "admin", "superadmin"]);
export type Role = z.infer<typeof RoleSchema>;

const money = z.number().finite().min(0).max(10_000_000_000);
const positiveMoney = z.number().finite().gt(0).max(10_000_000_000);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-mm-dd");
const monthKey = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use yyyy-mm");
const shortText = (max: number) => z.string().trim().max(max);

const expenseKeys = EXPENSE_CATEGORIES.map((c) => c.key);
const incomeKeys: string[] = INCOME_CATEGORIES.map((c) => c.key);
export const CategoryKeySchema = z.string().refine((k) => expenseKeys.includes(k) || incomeKeys.includes(k) || k === "savings" || k === "investments", "Unknown category");

export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(10).max(128),
  name: shortText(60).min(1),
  language: LangSchema.default("si"),
  acceptTerms: z.literal(true),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(10).max(128),
});

export const AGE_RANGES = ["u18", "a18", "a25", "a35", "a45", "a60"] as const;
export const EMPLOYMENT = ["student", "salaried", "selfEmployed", "business", "freelancer", "homemaker", "retired", "other"] as const;
export const HELP_OPTIONS = ["saveMore", "controlSpending", "understandMoney", "payDebt", "emergencyFund", "startInvesting", "household", "smallBusiness", "digitalPayments", "everything"] as const;
export const INCOME_RANGES = ["under30k", "r30to60", "r60to100", "r100to200", "over200k"] as const;
export const GOAL_TYPES = ["emergency", "laptop", "university", "wedding", "vehicle", "house", "travel", "business", "retirement", "custom"] as const;
export const DEBT_TYPES = ["personal", "housing", "vehicleLease", "creditCard", "education", "business", "informal", "pawning", "other"] as const;
export const APP_MODES = ["standard", "student", "family", "business"] as const;

export const ProfileUpdateSchema = z
  .object({
    name: shortText(60).min(1),
    language: LangSchema,
    ageRange: z.enum(AGE_RANGES).nullable(),
    employment: z.enum(EMPLOYMENT).nullable(),
    helpWith: z.array(z.enum(HELP_OPTIONS)).max(10),
    incomeRange: z.enum(INCOME_RANGES).nullable(),
    monthlyIncome: money.nullable(),
    monthlyExpenses: money.nullable(),
    currentSavings: money.nullable(),
    monthlyDebt: money.nullable(),
    primaryGoal: z.enum(GOAL_TYPES).nullable(),
    mode: z.enum(APP_MODES),
    onboardingCompleted: z.boolean(),
  })
  .partial();
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

export const PreferencesSchema = z.object({
  dataSaver: z.boolean(),
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
  textScale: z.number().min(0.85).max(1.5),
  notifyBills: z.boolean(),
  notifyBudget: z.boolean(),
  notifyGoals: z.boolean(),
  notifyLearning: z.boolean(),
});
export type Preferences = z.infer<typeof PreferencesSchema>;
export const PreferencesUpdateSchema = PreferencesSchema.partial();

export const ConsentSchema = z.object({
  aiDataAccess: z.boolean(),
  aiHistory: z.boolean(),
  analytics: z.boolean(),
});
export type Consents = z.infer<typeof ConsentSchema>;
export const ConsentUpdateSchema = ConsentSchema.partial();

export const TransactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: positiveMoney,
  categoryKey: CategoryKeySchema,
  date: isoDate,
  merchant: shortText(80).optional().nullable(),
  method: z.enum(PAYMENT_METHODS).optional().nullable(),
  notes: shortText(500).optional().nullable(),
  needWant: z.enum(["need", "want", "saving"]).optional().nullable(),
  recurring: z.boolean().optional(),
});
export type TransactionInput = z.infer<typeof TransactionSchema>;
export const TransactionUpdateSchema = TransactionSchema.partial();

export const TransactionQuerySchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  type: z.enum(["expense", "income"]).optional(),
  categoryKey: z.string().max(40).optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
});

export const CsvImportSchema = z.object({
  rows: z
    .array(
      z.object({
        date: isoDate,
        amount: z.number().finite(),
        description: shortText(120).optional(),
        categoryKey: z.string().max(40).optional(),
      }),
    )
    .min(1)
    .max(2000),
});

export const RecurringSchema = z.object({
  name: shortText(60).min(1),
  amount: positiveMoney,
  categoryKey: CategoryKeySchema,
  dayOfMonth: z.number().int().min(1).max(31),
  active: z.boolean().default(true),
});
export type RecurringInput = z.infer<typeof RecurringSchema>;

export const BudgetSchema = z.object({
  income: money,
  items: z.array(z.object({ categoryKey: CategoryKeySchema, planned: money })).max(40),
});
export type BudgetInput = z.infer<typeof BudgetSchema>;
export const MonthKeySchema = monthKey;

export const GoalSchema = z.object({
  name: shortText(60).min(1),
  type: z.enum(GOAL_TYPES),
  target: positiveMoney,
  saved: money.default(0),
  deadline: isoDate.nullable().optional(),
  status: z.enum(["active", "paused", "archived", "completed"]).default("active"),
});
export type GoalInput = z.infer<typeof GoalSchema>;
export const GoalUpdateSchema = GoalSchema.partial();
export const ContributionSchema = z.object({ amount: z.number().finite().refine((n) => n !== 0, "Amount required").refine((n) => Math.abs(n) <= 10_000_000_000), note: shortText(120).optional() });

export const DebtSchema = z.object({
  type: z.enum(DEBT_TYPES),
  lender: shortText(60).optional().nullable(),
  balance: money,
  ratePercent: z.number().min(0).max(200),
  monthlyPayment: money,
  remainingMonths: z.number().int().min(0).max(600).nullable().optional(),
  dueDay: z.number().int().min(1).max(31).nullable().optional(),
});
export type DebtInput = z.infer<typeof DebtSchema>;
export const DebtUpdateSchema = DebtSchema.partial();

export const LessonCompleteSchema = z.object({
  answers: z.record(z.string().max(20), z.string().max(20)),
});

export const ScamCheckSchema = z.object({ text: z.string().min(1).max(5000) });

export const AskSchema = z.object({
  question: z.string().trim().min(1).max(1000),
  lang: LangSchema,
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(10)
    .optional(),
});
export type AskInput = z.infer<typeof AskSchema>;

const L = z.object({ en: z.string().max(4000), si: z.string().max(4000), ta: z.string().max(4000) });
export const ContentStatusSchema = z.enum(["draft", "review", "approved", "published", "archived"]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const LessonUpsertSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,60}$/),
  courseSlug: z.string().regex(/^[a-z0-9-]{3,60}$/),
  title: L,
  summary: L,
  minutes: z.number().int().min(1).max(30),
  xp: z.number().int().min(0).max(200),
  tags: z.array(z.string().max(30)).max(12),
  protection: z.boolean().optional(),
  timeSensitive: z.boolean().optional(),
  cards: z
    .array(
      z.object({
        type: z.enum(["story", "concept", "example", "question", "tip", "warning"]),
        title: L.optional(),
        body: L,
        options: z.array(z.object({ text: L, correct: z.boolean() })).max(6).optional(),
        explanation: L.optional(),
      }),
    )
    .min(1)
    .max(20),
  quiz: z
    .array(
      z.object({
        id: z.string().max(20),
        type: z.enum(["mcq", "truefalse", "scenario", "calculation"]),
        prompt: L,
        options: z.array(z.object({ id: z.string().max(20), text: L })).min(2).max(6),
        correctId: z.string().max(20),
        explanation: L,
      }),
    )
    .min(3)
    .max(10),
  sources: z.array(z.object({ name: z.string().max(120), url: z.string().url().max(500) })).min(1).max(10),
  nextReview: isoDate.optional(),
});
export type LessonUpsert = z.infer<typeof LessonUpsertSchema>;

export const ContentStatusChangeSchema = z.object({ status: ContentStatusSchema });
export const RoleChangeSchema = z.object({ role: RoleSchema });

export * from "./dto.js";
export { z };
