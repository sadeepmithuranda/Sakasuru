import { describe, expect, it } from "vitest";
import {
  formatLKR,
  calculateSavingsRate,
  calculateDebtToIncome,
  calculateEmergencyFund,
  calculateGoalContribution,
  calculateCompoundInterest,
  calculateFutureValue,
  calculateLoanPayment,
  calculateLoanSchedule,
  calculateDebtPayoff,
  calculateInflationAdjustedValue,
  calculateFixedDeposit,
  compareSimpleAndCompound,
  simulateDebtStrategy,
  simulateExtraPayment,
  simulateCreditCard,
  summariseBudget,
  needsWantsSplit,
  budgetProgress,
  totalsByCategory,
  calculateHealthScore,
  bandFor,
  checkScamMessage,
  generateInsights,
  D,
} from "./index.js";

describe("money", () => {
  it("formats rupees the Sri Lankan way", () => {
    expect(formatLKR(25000)).toBe("Rs. 25,000");
    expect(formatLKR(1250.5)).toBe("Rs. 1,250.50");
    expect(formatLKR(-450)).toBe("-Rs. 450");
    expect(formatLKR(1234567.891)).toBe("Rs. 1,234,567.89");
  });
  it("does not drift with floating point", () => {
    expect(D(0.1).plus(0.2).toNumber()).toBe(0.3);
  });
});

describe("ratios", () => {
  it("savings rate", () => {
    expect(calculateSavingsRate(100000, 18000)).toBe(18);
    expect(calculateSavingsRate(0, 500)).toBe(0);
  });
  it("debt to income", () => {
    expect(calculateDebtToIncome(25000, 100000)).toBe(25);
  });
});

describe("emergency fund", () => {
  it("matches the spec example", () => {
    const r = calculateEmergencyFund(55000, 3, 80000);
    expect(r).toEqual({ recommended: 165000, current: 80000, remaining: 85000, progressPercent: 48.5 });
  });
  it("caps progress at 100%", () => {
    expect(calculateEmergencyFund(10000, 1, 50000).progressPercent).toBe(100);
  });
  it("rejects bad months", () => {
    expect(() => calculateEmergencyFund(1000, 0)).toThrow();
  });
});

describe("goal contribution", () => {
  it("monthly amount to reach a laptop goal", () => {
    const r = calculateGoalContribution(250000, 75000, new Date("2027-12-01"), new Date("2026-12-01"));
    expect(r.monthsLeft).toBe(12);
    expect(r.remaining).toBe(175000);
    expect(r.monthlyRequired).toBe(14584); // rounded up
    expect(r.progressPercent).toBe(30);
  });
  it("achieved goal needs nothing", () => {
    expect(calculateGoalContribution(1000, 1500, new Date("2030-01-01")).monthlyRequired).toBe(0);
  });
});

describe("interest", () => {
  it("annual compounding matches the textbook formula", () => {
    const r = calculateCompoundInterest({ principal: 100000, annualRatePercent: 10, years: 5, compoundsPerYear: 1 });
    expect(r.finalBalance).toBe(161051);
    expect(calculateFutureValue(100000, 10, 5)).toBe(161051);
  });
  it("contributions are counted", () => {
    const r = calculateCompoundInterest({ principal: 0, annualRatePercent: 0, years: 2, monthlyContribution: 1000 });
    expect(r.finalBalance).toBe(24000);
    expect(r.totalInterest).toBe(0);
    expect(r.yearly).toHaveLength(3);
  });
  it("simple vs compound", () => {
    const r = compareSimpleAndCompound(100000, 10, 2);
    expect(r.simpleTotal).toBe(120000);
    expect(r.compoundTotal).toBe(121000);
    expect(r.difference).toBe(1000);
  });
  it("fixed deposit simple interest", () => {
    expect(calculateFixedDeposit(100000, 12, 6)).toEqual({ maturityValue: 106000, interestEarned: 6000 });
  });
});

describe("loans", () => {
  it("EMI for Rs. 1,000,000 at 12% over 12 months", () => {
    expect(calculateLoanPayment(1000000, 12, 12)).toBe(88848.79);
  });
  it("zero-interest loan splits evenly", () => {
    expect(calculateLoanPayment(120000, 0, 12)).toBe(10000);
  });
  it("schedule clears the balance", () => {
    const s = calculateLoanSchedule(500000, 15, 24);
    expect(s.schedule.at(-1)?.balance).toBe(0);
    expect(s.totalPaid).toBeCloseTo(500000 + s.totalInterest, 1);
  });
  it("payoff detects payments that never clear", () => {
    expect(calculateDebtPayoff(100000, 24, 2000).paysOff).toBe(false);
    const ok = calculateDebtPayoff(100000, 24, 10000);
    expect(ok.paysOff).toBe(true);
    expect(ok.months).toBe(12);
  });
  it("extra payment clears sooner and saves interest", () => {
    const r = simulateExtraPayment(300000, 18, 10000, 5000, new Date("2026-10-01"));
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(r.interestSaved).toBeGreaterThan(0);
    expect(r.improved.payoffDate! < r.current.payoffDate!).toBe(true);
  });
  it("minimum-only credit card takes far longer than a fixed payment", () => {
    const r = simulateCreditCard({ balance: 100000, annualRatePercent: 28, minimumPercent: 5, minimumFloor: 1000, fixedPayment: 10000 });
    expect(r.minimumOnly.cleared).toBe(true);
    expect(r.minimumOnly.months).toBeGreaterThan(r.fixed!.months!);
    expect(r.minimumOnly.totalInterest).toBeGreaterThan(r.fixed!.totalInterest);
  });
});

describe("debt strategies", () => {
  const debts = [
    { id: "a", name: "Credit card", balance: 80000, annualRatePercent: 28, minimumPayment: 4000 },
    { id: "b", name: "Personal loan", balance: 300000, annualRatePercent: 16, minimumPayment: 12000 },
    { id: "c", name: "Friend", balance: 20000, annualRatePercent: 0, minimumPayment: 2000 },
  ];
  it("snowball clears the smallest balance first", () => {
    const r = simulateDebtStrategy(debts, 5000, "snowball");
    expect(r.order[0]?.id).toBe("c");
    expect(r.months).not.toBeNull();
  });
  it("avalanche never pays more interest than snowball", () => {
    const s = simulateDebtStrategy(debts, 5000, "snowball");
    const a = simulateDebtStrategy(debts, 5000, "avalanche");
    expect(a.totalInterest).toBeLessThanOrEqual(s.totalInterest);
  });
});

describe("inflation", () => {
  it("Rs. 10,000 at 5% for 10 years", () => {
    const r = calculateInflationAdjustedValue(10000, 5, 10);
    expect(r.futureCost).toBe(16288.95);
    expect(r.points).toHaveLength(11);
    expect(r.purchasingPowerOfToday).toBe(6139.13);
  });
});

describe("budget", () => {
  it("matches the spec example", () => {
    const r = summariseBudget(100000, [
      { categoryKey: "rent", planned: 30000 },
      { categoryKey: "groceries", planned: 42000 },
      { categoryKey: "savings", planned: 18000 },
    ]);
    expect(r).toEqual({ totalIncome: 100000, totalPlannedExpenses: 72000, plannedSavings: 18000, remaining: 10000, savingsRate: 18 });
  });
  it("needs / wants split", () => {
    const e = [
      { amount: 62000, categoryKey: "rent", date: "2026-10-01" },
      { amount: 23000, categoryKey: "shopping", date: "2026-10-02" },
    ];
    const r = needsWantsSplit(e, 100000);
    expect(r.needsPercent).toBe(62);
    expect(r.wantsPercent).toBe(23);
    expect(r.savingsPercent).toBe(15);
  });
  it("user override beats the default classification", () => {
    const r = needsWantsSplit([{ amount: 1000, categoryKey: "shopping", needWant: "need", date: "2026-10-01" }], 0);
    expect(r.needs).toBe(1000);
  });
  it("budget progress flags near and over", () => {
    const p = budgetProgress(
      [{ categoryKey: "groceries", planned: 10000 }, { categoryKey: "fuel", planned: 5000 }],
      [{ amount: 8500, categoryKey: "groceries", date: "2026-10-01" }, { amount: 6000, categoryKey: "fuel", date: "2026-10-01" }],
    );
    expect(p.map((x) => x.status)).toEqual(["near", "over"]);
  });
  it("totals sort largest first", () => {
    const t = totalsByCategory([
      { amount: 100, categoryKey: "bus", date: "2026-10-01" },
      { amount: 300, categoryKey: "rent", date: "2026-10-01" },
    ]);
    expect(t[0]?.categoryKey).toBe("rent");
    expect(t[0]?.percent).toBe(75);
  });
});

describe("health score", () => {
  const base = {
    monthlyIncome: 85000,
    monthlySpending: 58400,
    monthlySavings: 15000,
    essentialMonthlyExpenses: 45000,
    emergencyFundBalance: 82500,
    monthlyDebtPayments: 10000,
    hasBudget: true,
    budgetAdherence: 0.8,
    wantsShare: 0.28,
    activeGoals: 2,
    goalOnTrack: 0.7,
    lessonsCompleted: 6,
    protectionLessonsCompleted: 1,
  };
  it("is transparent and bounded", () => {
    const r = calculateHealthScore(base);
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.factors.reduce((a, f) => a + f.max, 0)).toBe(100);
    expect(r.factors.reduce((a, f) => a + f.score, 0)).toBe(r.score);
  });
  it("missing data scores zero but is flagged", () => {
    const r = calculateHealthScore({ ...base, monthlyIncome: null, monthlySavings: null, monthlySpending: null });
    expect(r.factors.find((f) => f.key === "saving")?.missingData).toBe(true);
  });
  it("bands", () => {
    expect([bandFor(10), bandFor(45), bandFor(72), bandFor(90)]).toEqual(["needsAttention", "building", "good", "strong"]);
  });
});

describe("scam checker", () => {
  it("flags the classic prize scam as high risk", () => {
    const r = checkScamMessage("Congratulations! You have won Rs. 500,000. Send your bank details and pay a small processing fee to claim it today only.");
    expect(r.risk).toBe("high");
    expect(r.signals.map((s) => s.key)).toEqual(expect.arrayContaining(["prizeOrLottery", "bankDetails", "upfrontFee", "urgency"]));
  });
  it("any OTP request is high risk", () => {
    expect(checkScamMessage("Please share the OTP you received").risk).toBe("high");
  });
  it("detects Sinhala warning signs", () => {
    const r = checkScamMessage("මාසයකට 20% සහතික ලාභ! අවදානමක් නැති ආයෝජනයක්. වහාම සම්බන්ධ වන්න.");
    expect(r.risk).toBe("high");
  });
  it("detects Tamil warning signs", () => {
    const r = checkScamMessage("உங்கள் ஓடிபி எண்ணை அனுப்பவும்");
    expect(r.risk).toBe("high");
  });
  it("ordinary message is low risk", () => {
    expect(checkScamMessage("Hi, are we still meeting for lunch at 1?").risk).toBe("low");
  });
});

describe("insights", () => {
  it("asks to start tracking when empty", () => {
    expect(generateInsights([], 50000, new Date("2026-10-15"))[0]?.key).toBe("insight.startTracking");
  });
  it("notices a category going down", () => {
    const e = [
      { amount: 12000, categoryKey: "fuel", date: "2026-09-10" },
      { amount: 8400, categoryKey: "fuel", date: "2026-10-10" },
    ];
    const i = generateInsights(e, 85000, new Date("2026-10-15"));
    expect(i.some((x) => x.key === "insight.categoryDown" && x.params.amount === 3600)).toBe(true);
  });
});
