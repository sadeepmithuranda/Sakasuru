import { D, Decimal, type Numeric, toMoney, toPercent, sum } from "./money.js";
import { getCategory, type NeedWant } from "./categories.js";

export interface ExpenseLike {
  amount: Numeric;
  categoryKey: string;
  needWant?: NeedWant | null;
  date: string; // ISO yyyy-mm-dd
}

export interface BudgetLine {
  categoryKey: string;
  planned: Numeric;
}

export interface BudgetSummary {
  totalIncome: number;
  totalPlannedExpenses: number;
  plannedSavings: number;
  remaining: number;
  savingsRate: number;
}

/** Budget totals. Lines in the "savings"/"investments" pseudo-categories count as savings. */
export function summariseBudget(income: Numeric, lines: BudgetLine[]): BudgetSummary {
  const savingKeys = new Set(["savings", "investments"]);
  const expenses = sum(lines.filter((l) => !savingKeys.has(l.categoryKey)).map((l) => l.planned));
  const savings = sum(lines.filter((l) => savingKeys.has(l.categoryKey)).map((l) => l.planned));
  const i = D(income);
  return {
    totalIncome: toMoney(i),
    totalPlannedExpenses: toMoney(expenses),
    plannedSavings: toMoney(savings),
    remaining: toMoney(i.minus(expenses).minus(savings)),
    savingsRate: i.gt(0) ? toPercent(savings.div(i)) : 0,
  };
}

export interface CategoryTotal {
  categoryKey: string;
  total: number;
  percent: number;
}

/** Spending grouped by category, largest first. */
export function totalsByCategory(expenses: ExpenseLike[]): CategoryTotal[] {
  const map = new Map<string, Decimal>();
  for (const e of expenses) map.set(e.categoryKey, (map.get(e.categoryKey) ?? D(0)).plus(D(e.amount)));
  const grand = sum([...map.values()]);
  return [...map.entries()]
    .map(([categoryKey, total]) => ({ categoryKey, total: toMoney(total), percent: grand.gt(0) ? toPercent(total.div(grand)) : 0 }))
    .sort((a, b) => b.total - a.total);
}

/** Spending grouped by top-level group (food, transport, ...). */
export function totalsByGroup(expenses: ExpenseLike[]): CategoryTotal[] {
  return totalsByCategory(expenses.map((e) => ({ ...e, categoryKey: getCategory(e.categoryKey).group })));
}

export interface NeedsWantsSplit {
  needs: number;
  wants: number;
  savings: number;
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
}

/**
 * Needs / wants / savings split of income. Savings = income − spending
 * (never below zero) plus any explicit saving transfers.
 */
export function needsWantsSplit(expenses: ExpenseLike[], income: Numeric, explicitSavings: Numeric = 0): NeedsWantsSplit {
  let needs = D(0);
  let wants = D(0);
  for (const e of expenses) {
    const kind = e.needWant ?? getCategory(e.categoryKey).kind;
    if (kind === "need") needs = needs.plus(D(e.amount));
    else if (kind === "want") wants = wants.plus(D(e.amount));
  }
  const inc = D(income);
  const savings = Decimal.max(inc.minus(needs).minus(wants), D(explicitSavings), 0);
  const base = Decimal.max(inc, needs.plus(wants).plus(savings));
  const pct = (v: Decimal) => (base.gt(0) ? toPercent(v.div(base)) : 0);
  return {
    needs: toMoney(needs),
    wants: toMoney(wants),
    savings: toMoney(savings),
    needsPercent: pct(needs),
    wantsPercent: pct(wants),
    savingsPercent: pct(savings),
  };
}

export interface BudgetProgress {
  categoryKey: string;
  planned: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "ok" | "near" | "over";
}

export function budgetProgress(lines: BudgetLine[], expenses: ExpenseLike[]): BudgetProgress[] {
  const spent = new Map(totalsByCategory(expenses).map((t) => [t.categoryKey, D(t.total)]));
  return lines.map((l) => {
    const planned = D(l.planned);
    const s = spent.get(l.categoryKey) ?? D(0);
    const used = planned.gt(0) ? s.div(planned) : s.gt(0) ? D(2) : D(0);
    return {
      categoryKey: l.categoryKey,
      planned: toMoney(planned),
      spent: toMoney(s),
      remaining: toMoney(planned.minus(s)),
      percentUsed: toPercent(used),
      status: used.gt(1) ? "over" : used.gte(0.8) ? "near" : "ok",
    };
  });
}
