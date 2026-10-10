import { desc, eq } from "drizzle-orm";
import { PreferencesSchema, type Consents, type MeDTO, type Preferences, type ProfileDTO } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import type { AppContext } from "../../lib/context.js";
import { notFound } from "../../lib/errors.js";

export const DEFAULT_PREFERENCES: Preferences = {
  dataSaver: false,
  reducedMotion: false,
  highContrast: false,
  textScale: 1,
  notifyBills: true,
  notifyBudget: true,
  notifyGoals: true,
  notifyLearning: true,
};

export async function getConsents(ctx: AppContext, userId: string): Promise<Consents> {
  const rows = await ctx.db.select().from(schema.consents).where(eq(schema.consents.userId, userId)).orderBy(desc(schema.consents.createdAt));
  const latest = (type: string) => rows.find((r) => r.type === type)?.granted ?? false;
  return { aiDataAccess: latest("aiDataAccess"), aiHistory: latest("aiHistory"), analytics: latest("analytics") };
}

export async function getProfile(ctx: AppContext, userId: string): Promise<ProfileDTO> {
  const [p] = await ctx.db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, userId));
  if (!p) throw notFound("Profile");
  const c = ctx.cipher;
  return {
    name: p.name,
    language: p.language as ProfileDTO["language"],
    ageRange: p.ageRange,
    employment: p.employment,
    helpWith: p.helpWith,
    incomeRange: p.incomeRange,
    monthlyIncome: c.decryptNumber(p.monthlyIncomeEnc),
    monthlyExpenses: c.decryptNumber(p.monthlyExpensesEnc),
    currentSavings: c.decryptNumber(p.currentSavingsEnc),
    monthlyDebt: c.decryptNumber(p.monthlyDebtEnc),
    primaryGoal: p.primaryGoal,
    mode: p.mode as ProfileDTO["mode"],
    onboardingCompleted: p.onboardingCompleted,
  };
}

export async function getPreferences(ctx: AppContext, userId: string): Promise<Preferences> {
  const [row] = await ctx.db.select().from(schema.userPreferences).where(eq(schema.userPreferences.userId, userId));
  const parsed = PreferencesSchema.partial().safeParse(row?.data ?? {});
  return { ...DEFAULT_PREFERENCES, ...(parsed.success ? parsed.data : {}) };
}

export async function loadMe(ctx: AppContext, userId: string): Promise<MeDTO> {
  const [u] = await ctx.db.select().from(schema.users).where(eq(schema.users.id, userId));
  if (!u) throw notFound("User");
  const [profile, preferences, consents] = await Promise.all([getProfile(ctx, userId), getPreferences(ctx, userId), getConsents(ctx, userId)]);
  return { user: { id: u.id, email: u.email, role: u.role as MeDTO["user"]["role"], createdAt: u.createdAt.toISOString() }, profile, preferences, consents };
}
