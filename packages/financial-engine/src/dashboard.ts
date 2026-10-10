import { D, Decimal, toMoney, toPercent, sum } from "./money.js";
import { getCategory } from "./categories.js";
import { budgetProgress, needsWantsSplit, totalsByCategory, totalsByGroup, type BudgetLine, type ExpenseLike } from "./budget.js";
import { calculateHealthScore, type HealthScoreResult } from "./health-score.js";
import { generateInsights } from "./insights.js";
import { calculateGoalContribution, calculateDebtPayoff, calculateDebtToIncome } from "./calculators.js";

/**
 * Domain service that assembles the home dashboard from raw records.
 * Shared by the API (PostgreSQL) and the web app's offline/demo store,
 * so both produce identical numbers.
 */

export interface TxRecord extends ExpenseLike {
  id: string;
  type: "expense" | "income";
  merchant?: string | null;
  method?: string | null;
  notes?: string | null;
  recurringId?: string | null;
  createdAt: string;
}

export interface GoalRecord {
  id: string;
  name: string;
  type: string;
  target: number;
  saved: number;
  deadline: string | null;
  status: "active" | "paused" | "archived" | "completed";
  createdAt: string;
  /** contributions made in the dashboard month */
  contributedThisMonth?: number;
}

export interface DebtRecord {
  id: string;
  type: string;
  lender: string | null;
  balance: number;
  ratePercent: number;
  monthlyPayment: number;
  remainingMonths: number | null;
  dueDay: number | null;
}

export interface RecurringRecord {
  id: string;
  name: string;
  amount: number;
  categoryKey: string;
  dayOfMonth: number;
  active: boolean;
}

export interface DashboardInput {
  today: Date;
  transactions: TxRecord[];
  budget: { income: number; items: BudgetLine[] } | null;
  goals: GoalRecord[];
  debts: DebtRecord[];
  recurring: RecurringRecord[];
  profile: { monthlyIncome: number | null; monthlyExpenses: number | null; currentSavings: number | null; monthlyDebt: number | null };
  lessonsCompleted: number;
  protectionLessonsCompleted: number;
  previousScore: number | null;
}

const SAVING_KEYS = new Set(["savings", "investments"]);
export const monthKeyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const isoOf = (d: Date) => `${monthKeyOf(d)}-${String(d.getDate()).padStart(2, "0")}`;

export function enrichGoal(g: GoalRecord, today: Date) {
  const c = g.deadline ? calculateGoalContribution(g.target, g.saved, new Date(g.deadline + "T00:00:00"), today) : null;
  const progressPercent = g.target > 0 ? Math.min(100, toPercent(D(g.saved).div(g.target))) : 100;
  return {
    id: g.id,
    name: g.name,
    type: g.type,
    target: g.target,
    saved: g.saved,
    deadline: g.deadline,
    status: g.status,
    createdAt: g.createdAt,
    monthlyRequired: c?.monthlyRequired ?? 0,
    progressPercent,
    monthsLeft: c?.monthsLeft ?? 0,
  };
}

export function enrichDebt(d: DebtRecord) {
  const p = calculateDebtPayoff(d.balance, d.ratePercent, d.monthlyPayment);
  return { ...d, payoffMonths: p.paysOff ? p.months : null, totalInterest: p.totalInterest };
}

export function nextDueDate(dayOfMonth: number, today: Date): Date {
  const clampDay = (y: number, m: number) => Math.min(dayOfMonth, new Date(y, m + 1, 0).getDate());
  const y = today.getFullYear();
  const m = today.getMonth();
  const thisMonth = new Date(y, m, clampDay(y, m));
  const t0 = new Date(y, m, today.getDate());
  if (thisMonth >= t0) return thisMonth;
  const nm = m === 11 ? 0 : m + 1;
  const ny = m === 11 ? y + 1 : y;
  return new Date(ny, nm, clampDay(ny, nm));
}

export function enrichRecurring(r: RecurringRecord, today: Date) {
  const due = nextDueDate(r.dayOfMonth, today);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysUntil = Math.round((due.getTime() - t0.getTime()) / 86_400_000);
  return { ...r, nextDue: isoOf(due), daysUntil };
}

/** Average monthly spend on essential categories over the last 3 complete months (falls back to this month). */
export function essentialMonthlyEstimate(transactions: TxRecord[], today: Date): number {
  const expenses = transactions.filter((t) => t.type === "expense" && getCategory(t.categoryKey).essential);
  const months: Decimal[] = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = monthKeyOf(d);
    const total = sum(expenses.filter((t) => t.date.startsWith(key)).map((t) => t.amount));
    if (total.gt(0)) months.push(total);
  }
  if (months.length) return toMoney(sum(months).div(months.length));
  return toMoney(sum(expenses.filter((t) => t.date.startsWith(monthKeyOf(today))).map((t) => t.amount)));
}

export function computeDashboard(input: DashboardInput) {
  const { today } = input;
  const month = monthKeyOf(today);
  const monthTx = input.transactions.filter((t) => t.date.startsWith(month));
  const expenses = monthTx.filter((t) => t.type === "expense" && !SAVING_KEYS.has(t.categoryKey));
  const savingTx = monthTx.filter((t) => t.type === "expense" && SAVING_KEYS.has(t.categoryKey));
  const incomeTx = monthTx.filter((t) => t.type === "income");

  const recordedIncome = sum(incomeTx.map((t) => t.amount));
  const income = recordedIncome.gt(0) ? recordedIncome : D(input.budget?.income || input.profile.monthlyIncome || 0);
  const spent = sum(expenses.map((t) => t.amount));
  const contributions = sum(input.goals.map((g) => g.contributedThisMonth ?? 0));
  const saved = contributions.plus(sum(savingTx.map((t) => t.amount)));
  const remaining = income.minus(spent).minus(saved);

  const needsWants = needsWantsSplit(expenses, income, saved);
  const byCategory = totalsByCategory(expenses);
  const byGroup = totalsByGroup(expenses);

  let budget: { planned: number; spent: number; progress: ReturnType<typeof budgetProgress> } | null = null;
  if (input.budget && input.budget.items.length) {
    const lines = input.budget.items.filter((l) => !SAVING_KEYS.has(l.categoryKey));
    const progress = budgetProgress(lines, expenses);
    budget = { planned: toMoney(sum(lines.map((l) => l.planned))), spent: toMoney(spent), progress };
  }

  const goals = input.goals.filter((g) => g.status !== "archived").map((g) => enrichGoal(g, today));
  const debts = input.debts.map(enrichDebt);
  const debtMonthly = input.debts.length ? toMoney(sum(input.debts.map((d) => d.monthlyPayment))) : (input.profile.monthlyDebt ?? 0);
  const debtTotal = toMoney(sum(input.debts.map((d) => d.balance)));

  const essentialMonthly = essentialMonthlyEstimate(input.transactions, today) || (input.profile.monthlyExpenses ?? 0);
  const emergencyGoals = input.goals.filter((g) => g.type === "emergency" && g.status !== "archived");
  const emergencyFund = emergencyGoals.length ? toMoney(sum(emergencyGoals.map((g) => g.saved))) : (input.profile.currentSavings ?? 0);

  // Goal on-track ratio: actual progress vs time elapsed toward the deadline.
  const active = input.goals.filter((g) => g.status === "active");
  const trackRatios = active.map((g) => {
    const progress = g.target > 0 ? Math.min(g.saved / g.target, 1) : 1;
    if (!g.deadline) return progress;
    const start = new Date(g.createdAt).getTime();
    const end = new Date(g.deadline + "T00:00:00").getTime();
    const expected = end > start ? Math.min(Math.max((today.getTime() - start) / (end - start), 0.05), 1) : 1;
    return Math.min(progress / expected, 1);
  });

  const hasExpenses = expenses.length > 0;
  const health: HealthScoreResult = calculateHealthScore({
    monthlyIncome: income.gt(0) ? income.toNumber() : null,
    monthlySpending: hasExpenses ? spent.toNumber() : null,
    monthlySavings: income.gt(0) ? Decimal.max(income.minus(spent), saved, 0).toNumber() : null,
    essentialMonthlyExpenses: essentialMonthly > 0 ? essentialMonthly : null,
    emergencyFundBalance: emergencyFund,
    monthlyDebtPayments: debtMonthly,
    hasBudget: !!budget,
    budgetAdherence: budget && hasExpenses ? budget.progress.filter((p) => p.status !== "over").length / Math.max(budget.progress.length, 1) : null,
    wantsShare: hasExpenses ? (needsWants.needs + needsWants.wants > 0 ? needsWants.wants / (needsWants.needs + needsWants.wants) : 0) : null,
    activeGoals: active.length,
    goalOnTrack: trackRatios.length ? trackRatios.reduce((a, b) => a + b, 0) / trackRatios.length : null,
    lessonsCompleted: input.lessonsCompleted,
    protectionLessonsCompleted: input.protectionLessonsCompleted,
  });

  const expenseHistory = input.transactions.filter((t) => t.type === "expense" && !SAVING_KEYS.has(t.categoryKey));
  const insights = generateInsights(expenseHistory, income.toNumber(), today);

  const recent = [...monthTx, ...input.transactions.filter((t) => !t.date.startsWith(month))]
    .sort((a, b) => (b.date === a.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)))
    .slice(0, 8);

  const upcomingBills = input.recurring
    .filter((r) => r.active)
    .map((r) => enrichRecurring(r, today))
    .filter((r) => r.daysUntil <= 14)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return {
    month,
    income: toMoney(income),
    spent: toMoney(spent),
    saved: toMoney(saved),
    remaining: toMoney(remaining),
    byGroup,
    byCategory,
    needsWants,
    budget,
    health,
    healthChange: input.previousScore === null ? null : health.score - input.previousScore,
    insights,
    recent,
    upcomingBills,
    goals,
    debts,
    essentialMonthly,
    emergencyFund,
    debtTotals: { total: debtTotal, monthly: debtMonthly, dti: calculateDebtToIncome(debtMonthly, income.toNumber()) },
  };
}

export type Dashboard = ReturnType<typeof computeDashboard>;
