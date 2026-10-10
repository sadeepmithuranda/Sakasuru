import { D, toMoney, toPercent } from "./money.js";
import { totalsByCategory, type ExpenseLike, needsWantsSplit } from "./budget.js";

/**
 * Non-judgmental, data-driven insights. Each insight is a translation key
 * plus parameters, so the UI renders it in Sinhala, Tamil or English.
 * Wording guidelines: describe, never shame; suggest, never command.
 */
export interface Insight {
  key: string;
  params: Record<string, string | number>;
  tone: "positive" | "neutral" | "tip";
  priority: number;
}

const inMonth = (iso: string, y: number, m: number) => {
  const [yy, mm] = iso.split("-").map(Number);
  return yy === y && mm === m + 1;
};

export function generateInsights(expenses: ExpenseLike[], income: number, today: Date = new Date()): Insight[] {
  const y = today.getFullYear();
  const m = today.getMonth();
  const prevY = m === 0 ? y - 1 : y;
  const prevM = m === 0 ? 11 : m - 1;
  const cur = expenses.filter((e) => inMonth(e.date, y, m));
  const prev = expenses.filter((e) => inMonth(e.date, prevY, prevM));
  const out: Insight[] = [];

  if (cur.length === 0) {
    out.push({ key: "insight.startTracking", params: {}, tone: "tip", priority: 1 });
    return out;
  }

  const spent = cur.reduce((a, e) => a.plus(D(e.amount)), D(0));
  // Only comment on the saving rate once there is enough data to be meaningful.
  if (income > 0 && cur.length >= 5) {
    const rate = toPercent(D(income).minus(spent).div(income));
    if (rate >= 10) out.push({ key: "insight.savingRateGood", params: { rate }, tone: "positive", priority: 3 });
  }

  const curTotals = totalsByCategory(cur);
  const prevTotals = new Map(totalsByCategory(prev).map((t) => [t.categoryKey, t.total]));
  for (const t of curTotals.slice(0, 6)) {
    const before = prevTotals.get(t.categoryKey);
    if (!before || before < 1000) continue;
    const change = toPercent(D(t.total).minus(before).div(before));
    if (change <= -10) out.push({ key: "insight.categoryDown", params: { category: t.categoryKey, amount: toMoney(D(before).minus(t.total)) }, tone: "positive", priority: 4 });
    else if (change >= 15) out.push({ key: "insight.categoryUp", params: { category: t.categoryKey, percent: Math.round(change) }, tone: "neutral", priority: 2 });
  }

  const delivery = curTotals.find((t) => t.categoryKey === "foodDelivery");
  if (delivery && delivery.total >= 2000) {
    const cut = Math.round(delivery.total / 3 / 100) * 100;
    out.push({ key: "insight.reduceToSave", params: { category: "foodDelivery", amount: delivery.total, cut, yearly: cut * 12 }, tone: "tip", priority: 3 });
  }

  const top = curTotals[0];
  if (top) out.push({ key: "insight.topCategory", params: { category: top.categoryKey, percent: Math.round(top.percent) }, tone: "neutral", priority: 1 });

  if (income > 0) {
    const split = needsWantsSplit(cur, income);
    if (split.wantsPercent > 35) out.push({ key: "insight.wantsHigh", params: { percent: Math.round(split.wantsPercent) }, tone: "tip", priority: 2 });
  }

  return out.sort((a, b) => b.priority - a.priority);
}
