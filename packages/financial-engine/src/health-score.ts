import { D, Decimal, type Numeric } from "./money.js";

/**
 * සකසුරු Financial Health Score — an EDUCATIONAL indicator (0–100).
 * It is not a credit score and must never be used to judge eligibility
 * for loans or services. Every factor, weight and rule is visible here
 * and is shown to the user in the app.
 */

export interface HealthInput {
  monthlyIncome: Numeric | null;
  monthlySpending: Numeric | null;
  /** savings set aside this month (transfers to goals etc.) */
  monthlySavings: Numeric | null;
  essentialMonthlyExpenses: Numeric | null;
  emergencyFundBalance: Numeric | null;
  monthlyDebtPayments: Numeric | null;
  hasBudget: boolean;
  /** share of budget categories within limit, 0..1 (null = no data) */
  budgetAdherence: number | null;
  /** wants as share of spending, 0..1 */
  wantsShare: number | null;
  activeGoals: number;
  /** average progress of active goals vs schedule, 0..1 */
  goalOnTrack: number | null;
  lessonsCompleted: number;
  protectionLessonsCompleted: number;
}

export type FactorKey = "saving" | "emergency" | "debt" | "budgeting" | "spending" | "goals" | "knowledge" | "protection";

export interface FactorResult {
  key: FactorKey;
  score: number;
  max: number;
  /** translation key for a short improvement tip, present when the factor isn't full */
  tipKey: string | null;
  /** true when we lacked data and the factor scored 0 for that reason */
  missingData: boolean;
}

export type HealthBand = "needsAttention" | "building" | "good" | "strong";

export interface HealthScoreResult {
  score: number;
  band: HealthBand;
  factors: FactorResult[];
  version: string;
}

export const HEALTH_SCORE_VERSION = "1.0";

export const HEALTH_WEIGHTS: Record<FactorKey, number> = {
  saving: 20,
  emergency: 20,
  debt: 15,
  budgeting: 15,
  spending: 10,
  goals: 10,
  knowledge: 5,
  protection: 5,
};

/** Linear scale: value at `lo` → 0, at `hi` → 1 (works for descending ranges). */
const scale = (v: Decimal, lo: number, hi: number): Decimal => {
  const t = v.minus(lo).div(hi - lo);
  return Decimal.min(Decimal.max(t, 0), 1);
};

const pts = (ratio: Decimal, max: number) => Math.round(ratio.times(max).toNumber());

export const bandFor = (score: number): HealthBand => (score >= 80 ? "strong" : score >= 60 ? "good" : score >= 40 ? "building" : "needsAttention");

export function calculateHealthScore(input: HealthInput): HealthScoreResult {
  const f: FactorResult[] = [];
  const W = HEALTH_WEIGHTS;
  const income = input.monthlyIncome === null ? null : D(input.monthlyIncome);

  // 1. Saving habit — savings rate; 20%+ of income earns full marks.
  if (income && income.gt(0) && (input.monthlySavings !== null || input.monthlySpending !== null)) {
    const saved = input.monthlySavings !== null ? D(input.monthlySavings) : Decimal.max(income.minus(D(input.monthlySpending ?? 0)), 0);
    const s = pts(scale(saved.div(income), 0, 0.2), W.saving);
    f.push({ key: "saving", score: s, max: W.saving, tipKey: s < W.saving ? "health.tip.saving" : null, missingData: false });
  } else f.push({ key: "saving", score: 0, max: W.saving, tipKey: "health.tip.addIncome", missingData: true });

  // 2. Emergency fund — months of essential expenses covered; 6 months = full.
  if (input.essentialMonthlyExpenses !== null && D(input.essentialMonthlyExpenses).gt(0)) {
    const months = D(input.emergencyFundBalance ?? 0).div(D(input.essentialMonthlyExpenses));
    const s = pts(scale(months, 0, 6), W.emergency);
    f.push({ key: "emergency", score: s, max: W.emergency, tipKey: s < W.emergency ? "health.tip.emergency" : null, missingData: false });
  } else f.push({ key: "emergency", score: 0, max: W.emergency, tipKey: "health.tip.addExpenses", missingData: true });

  // 3. Debt level — debt-to-income ≤10% full marks, ≥50% zero. No debt = full.
  const debt = D(input.monthlyDebtPayments ?? 0);
  if (debt.isZero()) f.push({ key: "debt", score: W.debt, max: W.debt, tipKey: null, missingData: false });
  else if (income && income.gt(0)) {
    const s = pts(D(1).minus(scale(debt.div(income), 0.1, 0.5)), W.debt);
    f.push({ key: "debt", score: s, max: W.debt, tipKey: s < W.debt ? "health.tip.debt" : null, missingData: false });
  } else f.push({ key: "debt", score: 0, max: W.debt, tipKey: "health.tip.addIncome", missingData: true });

  // 4. Budgeting behaviour — having a budget (5) + staying within it (10).
  {
    const has = input.hasBudget ? 5 : 0;
    const adh = input.budgetAdherence === null ? 0 : pts(D(input.budgetAdherence), 10);
    const s = has + adh;
    f.push({ key: "budgeting", score: s, max: W.budgeting, tipKey: !input.hasBudget ? "health.tip.createBudget" : s < W.budgeting ? "health.tip.budgetAdherence" : null, missingData: input.budgetAdherence === null && input.hasBudget });
  }

  // 5. Expense control — wants ≤30% of spending full marks, ≥60% zero.
  if (input.wantsShare !== null) {
    const s = pts(D(1).minus(scale(D(input.wantsShare), 0.3, 0.6)), W.spending);
    f.push({ key: "spending", score: s, max: W.spending, tipKey: s < W.spending ? "health.tip.spending" : null, missingData: false });
  } else f.push({ key: "spending", score: 0, max: W.spending, tipKey: "health.tip.trackExpenses", missingData: true });

  // 6. Goals — having an active goal (3) + being on track (7).
  {
    const has = input.activeGoals > 0 ? 3 : 0;
    const track = input.goalOnTrack === null ? 0 : pts(D(input.goalOnTrack), 7);
    const s = has + track;
    f.push({ key: "goals", score: s, max: W.goals, tipKey: input.activeGoals === 0 ? "health.tip.createGoal" : s < W.goals ? "health.tip.goalProgress" : null, missingData: false });
  }

  // 7. Financial knowledge — 1 point per 2 lessons, up to 10 lessons.
  {
    const s = Math.min(Math.floor(input.lessonsCompleted / 2), W.knowledge);
    f.push({ key: "knowledge", score: s, max: W.knowledge, tipKey: s < W.knowledge ? "health.tip.learn" : null, missingData: false });
  }

  // 8. Protection awareness — scam / digital-safety lessons, 3 for full marks.
  {
    const s = Math.round(Math.min(input.protectionLessonsCompleted / 3, 1) * W.protection);
    f.push({ key: "protection", score: s, max: W.protection, tipKey: s < W.protection ? "health.tip.protection" : null, missingData: false });
  }

  const score = Math.max(0, Math.min(100, f.reduce((a, x) => a + x.score, 0)));
  return { score, band: bandFor(score), factors: f, version: HEALTH_SCORE_VERSION };
}

/** Explain how two scores differ, factor by factor. */
export function diffHealthScores(prev: HealthScoreResult, next: HealthScoreResult) {
  return next.factors
    .map((nf) => {
      const pf = prev.factors.find((p) => p.key === nf.key);
      return { key: nf.key, change: nf.score - (pf?.score ?? 0) };
    })
    .filter((c) => c.change !== 0);
}
