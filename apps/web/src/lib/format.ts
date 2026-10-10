import type { Insight } from "@sakasuru/financial-engine";
import type { NotificationDTO } from "@sakasuru/validation";
import { BADGES } from "@sakasuru/content";

type T = (key: string, params?: Record<string, string | number>) => string;
type M = (n: number) => string;

const MONEY_PARAMS = new Set(["amount", "cut", "yearly"]);

/** Render an insight (key + params) in the current language with rupee formatting. */
export function renderInsight(t: T, money: M, i: Insight): string {
  const params: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(i.params)) {
    if (k === "category") params[k] = t(`categories.${v}`);
    else if (MONEY_PARAMS.has(k) && typeof v === "number") params[k] = money(v);
    else params[k] = v;
  }
  return t(i.key, params);
}

export function renderNotification(t: T, money: M, n: NotificationDTO, pickBadge: (key: string) => string): string {
  const params: Record<string, string | number> = { ...n.params };
  if (typeof params.category === "string") params.category = t(`categories.${params.category}`);
  if (typeof params.amount === "number") params.amount = money(params.amount);
  if (typeof params.badge === "string") params.badge = pickBadge(params.badge);
  return t(n.key, params);
}

export const badgeByKey = (key: string) => BADGES.find((b) => b.key === key);

export function monthsLabel(t: T, months: number | null): string {
  if (months === null) return t("tools.results.never");
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y ? (m ? t("tools.yearsMonths", { y, m }) : t("common.yearsCount", { n: y })) : t("common.monthsCount", { n: m });
}
