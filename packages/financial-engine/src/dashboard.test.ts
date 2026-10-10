import { describe, expect, it } from "vitest";
import { computeDashboard, nextDueDate, type TxRecord } from "./index.js";

const tx = (id: string, type: "expense" | "income", amount: number, categoryKey: string, date: string): TxRecord => ({ id, type, amount, categoryKey, date, createdAt: date + "T10:00:00Z" });

describe("dashboard", () => {
  const today = new Date(2026, 9, 15); // 15 Oct 2026
  const base = {
    today,
    transactions: [
      tx("1", "income", 85000, "salary", "2026-10-01"),
      tx("2", "expense", 20000, "rent", "2026-10-02"),
      tx("3", "expense", 12000, "groceries", "2026-10-05"),
      tx("4", "expense", 6000, "foodDelivery", "2026-10-07"),
      tx("5", "expense", 3000, "savings", "2026-10-08"),
      tx("6", "expense", 22000, "rent", "2026-09-02"),
    ],
    budget: { income: 85000, items: [{ categoryKey: "rent", planned: 20000 }, { categoryKey: "groceries", planned: 15000 }, { categoryKey: "foodDelivery", planned: 4000 }] },
    goals: [{ id: "g", name: "Emergency", type: "emergency", target: 180000, saved: 82500, deadline: "2027-06-30", status: "active" as const, createdAt: "2026-01-01T00:00:00Z", contributedThisMonth: 5000 }],
    debts: [{ id: "d", type: "personal", lender: null, balance: 200000, ratePercent: 16, monthlyPayment: 10000, remainingMonths: 24, dueDay: 10 }],
    recurring: [{ id: "r", name: "Rent", amount: 20000, categoryKey: "rent", dayOfMonth: 17, active: true }],
    profile: { monthlyIncome: null, monthlyExpenses: null, currentSavings: null, monthlyDebt: null },
    lessonsCompleted: 4,
    protectionLessonsCompleted: 1,
    previousScore: 60,
  };
  it("computes the headline numbers", () => {
    const d = computeDashboard(base);
    expect(d.income).toBe(85000);
    expect(d.spent).toBe(38000); // savings category excluded from spending
    expect(d.saved).toBe(8000); // 5,000 contribution + 3,000 savings transfer
    expect(d.remaining).toBe(39000);
    expect(d.budget?.progress.find((p) => p.categoryKey === "foodDelivery")?.status).toBe("over");
    expect(d.upcomingBills[0]?.daysUntil).toBe(2);
    expect(d.health.score).toBeGreaterThan(0);
    expect(d.healthChange).toBe(d.health.score - 60);
    expect(d.emergencyFund).toBe(82500);
    expect(d.debtTotals.dti).toBe(11.8);
  });
  it("falls back to profile income when nothing recorded", () => {
    const d = computeDashboard({ ...base, transactions: [], budget: null, profile: { ...base.profile, monthlyIncome: 50000 } });
    expect(d.income).toBe(50000);
    expect(d.insights[0]?.key).toBe("insight.startTracking");
  });
  it("next due date rolls into next month and clamps short months", () => {
    expect(nextDueDate(10, new Date(2026, 9, 15)).getMonth()).toBe(10);
    expect(nextDueDate(31, new Date(2026, 1, 3)).getDate()).toBe(28);
  });
});
