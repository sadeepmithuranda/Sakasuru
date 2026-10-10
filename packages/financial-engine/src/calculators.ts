import { D, Decimal, type Numeric, toMoney, toPercent, assertNonNegative } from "./money.js";

/* ------------------------------------------------------------------ */
/* Savings & budgeting                                                 */
/* ------------------------------------------------------------------ */

/** Savings rate as a percentage of income (0 when income is 0). */
export function calculateSavingsRate(income: Numeric, savings: Numeric): number {
  const i = D(income);
  if (i.lte(0)) return 0;
  return toPercent(D(savings).div(i));
}

/** Debt-to-income ratio as a percentage of monthly income. */
export function calculateDebtToIncome(monthlyDebtPayments: Numeric, monthlyIncome: Numeric): number {
  const i = D(monthlyIncome);
  if (i.lte(0)) return 0;
  return toPercent(D(monthlyDebtPayments).div(i));
}

export interface EmergencyFundResult {
  recommended: number;
  current: number;
  remaining: number;
  progressPercent: number;
}

/** Emergency fund target = essential monthly expenses × months of cover. */
export function calculateEmergencyFund(essentialMonthly: Numeric, months: number, current: Numeric = 0): EmergencyFundResult {
  assertNonNegative("essentialMonthly", essentialMonthly);
  if (!Number.isInteger(months) || months <= 0) throw new RangeError("months must be a positive integer");
  const recommended = D(essentialMonthly).times(months);
  const cur = D(current);
  const remaining = Decimal.max(recommended.minus(cur), 0);
  const progress = recommended.isZero() ? D(1) : Decimal.min(cur.div(recommended), 1);
  return {
    recommended: toMoney(recommended),
    current: toMoney(cur),
    remaining: toMoney(remaining),
    progressPercent: toPercent(progress),
  };
}

/** Whole months between two dates (partial month counts as one). */
export function monthsBetween(from: Date, to: Date): number {
  const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  const partial = to.getDate() > from.getDate() ? 1 : 0;
  return Math.max(months + partial, 0);
}

export interface GoalContributionResult {
  remaining: number;
  monthsLeft: number;
  monthlyRequired: number;
  progressPercent: number;
  achieved: boolean;
}

/** How much to save each month to reach a goal by its deadline (no interest assumed). */
export function calculateGoalContribution(target: Numeric, saved: Numeric, deadline: Date, from: Date = new Date()): GoalContributionResult {
  assertNonNegative("target", target);
  const t = D(target);
  const s = D(saved);
  const remaining = Decimal.max(t.minus(s), 0);
  const monthsLeft = monthsBetween(from, deadline);
  const monthly = remaining.isZero() ? D(0) : monthsLeft <= 0 ? remaining : remaining.div(monthsLeft);
  return {
    remaining: toMoney(remaining),
    monthsLeft,
    monthlyRequired: toMoney(monthly.toDecimalPlaces(0, Decimal.ROUND_UP)),
    progressPercent: t.isZero() ? 100 : toPercent(Decimal.min(s.div(t), 1)),
    achieved: remaining.isZero(),
  };
}

/* ------------------------------------------------------------------ */
/* Interest & growth                                                   */
/* ------------------------------------------------------------------ */

export interface CompoundInterestInput {
  principal: Numeric;
  /** Annual rate in percent, e.g. 8 for 8% */
  annualRatePercent: Numeric;
  years: number;
  compoundsPerYear?: number;
  monthlyContribution?: Numeric;
}

export interface GrowthPoint {
  year: number;
  balance: number;
  contributed: number;
  interest: number;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  yearly: GrowthPoint[];
}

/**
 * Compound growth with optional monthly contributions.
 * Contributions are added at the end of each month; interest compounds
 * `compoundsPerYear` times a year (monthly by default).
 */
export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const { years } = input;
  const n = input.compoundsPerYear ?? 12;
  assertNonNegative("principal", input.principal);
  if (years < 0 || years > 100) throw new RangeError("years must be between 0 and 100");
  const rate = D(input.annualRatePercent).div(100);
  const monthly = D(input.monthlyContribution ?? 0);
  // Effective monthly growth factor derived from the compounding frequency.
  const monthlyFactor = D(1).plus(rate.div(n)).pow(D(n).div(12));

  let balance = D(input.principal);
  let contributed = D(input.principal);
  const yearly: GrowthPoint[] = [{ year: 0, balance: toMoney(balance), contributed: toMoney(contributed), interest: 0 }];
  const totalMonths = Math.round(years * 12);
  for (let m = 1; m <= totalMonths; m++) {
    balance = balance.times(monthlyFactor).plus(monthly);
    contributed = contributed.plus(monthly);
    if (m % 12 === 0 || m === totalMonths) {
      yearly.push({
        year: Math.round((m / 12) * 100) / 100,
        balance: toMoney(balance),
        contributed: toMoney(contributed),
        interest: toMoney(balance.minus(contributed)),
      });
    }
  }
  return {
    finalBalance: toMoney(balance),
    totalContributed: toMoney(contributed),
    totalInterest: toMoney(balance.minus(contributed)),
    yearly,
  };
}

/** Future value of a lump sum. */
export function calculateFutureValue(presentValue: Numeric, annualRatePercent: Numeric, years: number, compoundsPerYear = 1): number {
  const r = D(annualRatePercent).div(100).div(compoundsPerYear);
  return toMoney(D(presentValue).times(D(1).plus(r).pow(compoundsPerYear * years)));
}

/** Simple vs compound interest for the same deposit. */
export function compareSimpleAndCompound(principal: Numeric, annualRatePercent: Numeric, years: number) {
  const p = D(principal);
  const r = D(annualRatePercent).div(100);
  const simple = p.plus(p.times(r).times(years));
  const compound = p.times(D(1).plus(r).pow(years));
  return {
    simpleTotal: toMoney(simple),
    compoundTotal: toMoney(compound),
    difference: toMoney(compound.minus(simple)),
  };
}

export interface FixedDepositResult {
  maturityValue: number;
  interestEarned: number;
}

/**
 * Fixed deposit maturity value. "simple" pays principal × rate × term at maturity;
 * "compound-monthly" reinvests interest every month. Actual bank terms vary.
 */
export function calculateFixedDeposit(principal: Numeric, annualRatePercent: Numeric, months: number, mode: "simple" | "compound-monthly" = "simple"): FixedDepositResult {
  assertNonNegative("principal", principal);
  const p = D(principal);
  const r = D(annualRatePercent).div(100);
  const value = mode === "simple" ? p.plus(p.times(r).times(months).div(12)) : p.times(D(1).plus(r.div(12)).pow(months));
  return { maturityValue: toMoney(value), interestEarned: toMoney(value.minus(p)) };
}

export interface InflationResult {
  futureCost: number;
  purchasingPowerOfToday: number;
  points: { year: number; cost: number }[];
}

/**
 * What something costing `amount` today may cost after `years` at an assumed
 * average inflation rate, and what today's amount would buy then.
 */
export function calculateInflationAdjustedValue(amount: Numeric, annualInflationPercent: Numeric, years: number): InflationResult {
  const factor = D(1).plus(D(annualInflationPercent).div(100));
  const points: { year: number; cost: number }[] = [];
  for (let y = 0; y <= years; y++) points.push({ year: y, cost: toMoney(D(amount).times(factor.pow(y))) });
  const future = D(amount).times(factor.pow(years));
  return {
    futureCost: toMoney(future),
    purchasingPowerOfToday: toMoney(D(amount).div(factor.pow(years))),
    points,
  };
}

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: Numeric;
  monthlyContribution: Numeric;
  annualReturnPercent: Numeric;
  annualInflationPercent: Numeric;
}

export function calculateRetirement(input: RetirementInput) {
  const years = Math.max(input.retirementAge - input.currentAge, 0);
  const growth = calculateCompoundInterest({
    principal: input.currentSavings,
    annualRatePercent: input.annualReturnPercent,
    years,
    monthlyContribution: input.monthlyContribution,
  });
  const realValue = D(growth.finalBalance).div(D(1).plus(D(input.annualInflationPercent).div(100)).pow(years));
  return { years, nominalValue: growth.finalBalance, valueInTodaysRupees: toMoney(realValue), yearly: growth.yearly };
}

/* ------------------------------------------------------------------ */
/* Loans & debt                                                        */
/* ------------------------------------------------------------------ */

/** Monthly instalment (EMI) for a reducing-balance loan. */
export function calculateLoanPayment(principal: Numeric, annualRatePercent: Numeric, months: number): number {
  assertNonNegative("principal", principal);
  if (!Number.isInteger(months) || months <= 0) throw new RangeError("months must be a positive integer");
  const p = D(principal);
  const r = D(annualRatePercent).div(100).div(12);
  if (r.isZero()) return toMoney(p.div(months));
  const factor = D(1).plus(r).pow(months);
  return toMoney(p.times(r).times(factor).div(factor.minus(1)));
}

export interface LoanSummary {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[];
}

export function calculateLoanSchedule(principal: Numeric, annualRatePercent: Numeric, months: number): LoanSummary {
  const payment = D(calculateLoanPayment(principal, annualRatePercent, months));
  const r = D(annualRatePercent).div(100).div(12);
  let balance = D(principal);
  let totalInterest = D(0);
  let totalPaid = D(0);
  const schedule: LoanSummary["schedule"] = [];
  for (let m = 1; m <= months && balance.gt(0); m++) {
    const interest = balance.times(r).toDecimalPlaces(2);
    let pay = payment;
    if (m === months || pay.gt(balance.plus(interest))) pay = balance.plus(interest);
    const princ = pay.minus(interest);
    balance = balance.minus(princ);
    totalInterest = totalInterest.plus(interest);
    totalPaid = totalPaid.plus(pay);
    schedule.push({ month: m, payment: toMoney(pay), principal: toMoney(princ), interest: toMoney(interest), balance: toMoney(Decimal.max(balance, 0)) });
  }
  return { monthlyPayment: toMoney(payment), totalPaid: toMoney(totalPaid), totalInterest: toMoney(totalInterest), schedule };
}

export interface DebtPayoffResult {
  /** null when the payment never clears the balance (it doesn't cover interest). */
  months: number | null;
  totalInterest: number;
  totalPaid: number;
  paysOff: boolean;
}

const MAX_SIM_MONTHS = 600;

/** Months and interest to clear a balance with a fixed monthly payment. */
export function calculateDebtPayoff(balance: Numeric, annualRatePercent: Numeric, monthlyPayment: Numeric): DebtPayoffResult {
  let b = D(balance);
  const r = D(annualRatePercent).div(100).div(12);
  const pay = D(monthlyPayment);
  if (b.lte(0)) return { months: 0, totalInterest: 0, totalPaid: 0, paysOff: true };
  if (pay.lte(b.times(r))) return { months: null, totalInterest: 0, totalPaid: 0, paysOff: false };
  let interestTotal = D(0);
  let paid = D(0);
  let m = 0;
  while (b.gt(0) && m < MAX_SIM_MONTHS) {
    const interest = b.times(r);
    interestTotal = interestTotal.plus(interest);
    const p = Decimal.min(pay, b.plus(interest));
    b = b.plus(interest).minus(p);
    paid = paid.plus(p);
    m++;
  }
  return { months: m, totalInterest: toMoney(interestTotal), totalPaid: toMoney(paid), paysOff: b.lte(0) };
}

export interface CreditCardInput {
  balance: Numeric;
  annualRatePercent: Numeric;
  /** Minimum payment as % of balance, e.g. 5 */
  minimumPercent: Numeric;
  /** Floor for the minimum payment in rupees */
  minimumFloor: Numeric;
  /** Optional fixed payment to compare against */
  fixedPayment?: Numeric;
}

/**
 * Credit-card repayment when paying only the minimum each month
 * (minimum = max(minimumPercent × balance, minimumFloor)), versus a fixed payment.
 */
export function simulateCreditCard(input: CreditCardInput) {
  const r = D(input.annualRatePercent).div(100).div(12);
  let b = D(input.balance);
  let interest = D(0);
  let m = 0;
  while (b.gt(0) && m < MAX_SIM_MONTHS) {
    const i = b.times(r);
    b = b.plus(i);
    interest = interest.plus(i);
    const min = Decimal.min(Decimal.max(b.times(D(input.minimumPercent).div(100)), D(input.minimumFloor)), b);
    b = b.minus(min);
    m++;
  }
  const minimumOnly = { months: m, totalInterest: toMoney(interest), totalPaid: toMoney(D(input.balance).plus(interest)), cleared: b.lte(0) };
  const fixed = input.fixedPayment !== undefined ? calculateDebtPayoff(input.balance, input.annualRatePercent, input.fixedPayment) : null;
  return { minimumOnly, fixed };
}

export interface DebtInput {
  id: string;
  name: string;
  balance: Numeric;
  annualRatePercent: Numeric;
  minimumPayment: Numeric;
}

export type DebtStrategy = "snowball" | "avalanche";

export interface StrategyResult {
  strategy: DebtStrategy;
  months: number | null;
  totalInterest: number;
  order: { id: string; name: string; paidOffMonth: number | null }[];
}

/**
 * Simulate paying several debts with a total monthly budget
 * (sum of minimums + extra). Snowball targets the smallest balance first,
 * avalanche the highest interest rate first. Freed-up minimums roll over.
 */
export function simulateDebtStrategy(debts: DebtInput[], extraMonthly: Numeric, strategy: DebtStrategy): StrategyResult {
  const state = debts.map((d) => ({ ...d, bal: D(d.balance), rate: D(d.annualRatePercent).div(100).div(12), min: D(d.minimumPayment), paidOffMonth: null as number | null }));
  const budget = state.reduce((a, d) => a.plus(d.min), D(0)).plus(D(extraMonthly));
  let totalInterest = D(0);
  let month = 0;
  const priority = () =>
    state
      .filter((d) => d.bal.gt(0))
      .sort((a, b) => (strategy === "snowball" ? a.bal.comparedTo(b.bal) : b.rate.comparedTo(a.rate) || a.bal.comparedTo(b.bal)));

  while (state.some((d) => d.bal.gt(0)) && month < MAX_SIM_MONTHS) {
    month++;
    for (const d of state) {
      if (d.bal.lte(0)) continue;
      const i = d.bal.times(d.rate);
      d.bal = d.bal.plus(i);
      totalInterest = totalInterest.plus(i);
    }
    let available = budget;
    // pay minimums
    for (const d of state) {
      if (d.bal.lte(0)) continue;
      const p = Decimal.min(d.min, d.bal, available);
      d.bal = d.bal.minus(p);
      available = available.minus(p);
    }
    // throw the rest at the priority debt(s)
    for (const d of priority()) {
      if (available.lte(0)) break;
      const p = Decimal.min(available, d.bal);
      d.bal = d.bal.minus(p);
      available = available.minus(p);
    }
    for (const d of state) if (d.bal.lte(0) && d.paidOffMonth === null) d.paidOffMonth = month;
    // Budget can't cover interest: stop early
    if (month === 1 && state.every((d) => d.bal.gt(D(d.balance)))) {
      return { strategy, months: null, totalInterest: 0, order: state.map((d) => ({ id: d.id, name: d.name, paidOffMonth: null })) };
    }
  }
  const done = state.every((d) => d.bal.lte(0));
  const order = [...state]
    .sort((a, b) => (a.paidOffMonth ?? Infinity) - (b.paidOffMonth ?? Infinity))
    .map((d) => ({ id: d.id, name: d.name, paidOffMonth: d.paidOffMonth }));
  return { strategy, months: done ? month : null, totalInterest: toMoney(totalInterest), order };
}

/** "If I pay Rs. X more each month, how much sooner?" */
export function simulateExtraPayment(balance: Numeric, annualRatePercent: Numeric, monthlyPayment: Numeric, extra: Numeric, from: Date = new Date()) {
  const current = calculateDebtPayoff(balance, annualRatePercent, monthlyPayment);
  const improved = calculateDebtPayoff(balance, annualRatePercent, D(monthlyPayment).plus(D(extra)));
  const addMonths = (n: number | null) => {
    if (n === null) return null;
    const d = new Date(from);
    d.setMonth(d.getMonth() + n);
    return d.toISOString().slice(0, 10);
  };
  return {
    current: { ...current, payoffDate: addMonths(current.months) },
    improved: { ...improved, payoffDate: addMonths(improved.months) },
    monthsSaved: current.months !== null && improved.months !== null ? current.months - improved.months : null,
    interestSaved: current.paysOff && improved.paysOff ? toMoney(D(current.totalInterest).minus(improved.totalInterest)) : null,
  };
}
