import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Share2, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { badgeByKey } from "@/lib/format";
import { Button, Skeleton, useToast } from "@/components/ui";
import { thisMonth, cx } from "@/lib/util";

/** "Your සකසුරු Monthly Report" — what happened, in plain words. */
export function ReportTab() {
  const { t, money, month, pick } = useI18n();
  const toast = useToast();
  const [m, setM] = useState(thisMonth());
  const { data: r, isLoading } = useQuery({ queryKey: ["report", m], queryFn: () => api.monthlyReport(m) });
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const share = async () => {
    // Shares progress without exposing amounts.
    const text = `${t("report.title")} — ${month(m)}\n${t("report.savingsRate")}: ${r?.savingsRate ?? 0}%\n${t("report.lessons")}: ${r?.lessonsCompleted ?? 0}\n${t("report.scoreChange")}: ${r?.healthScore ?? "—"}`;
    try {
      await navigator.share({ text });
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        toast(t("common.saved"));
      } catch {
        /* sharing unavailable in this browser */
      }
    }
  };
  return (
    <div>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {months.map((x) => (
          <button key={x} onClick={() => setM(x)} className={cx("whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold", x === m ? "border-leaf-600 bg-leaf-600 text-white" : "border-line bg-card")}>
            {month(x)}
          </button>
        ))}
      </div>
      {isLoading || !r ? (
        <Skeleton className="mt-6 h-80" />
      ) : r.income === 0 && r.expenses === 0 ? (
        <p className="mt-6 text-muted">{t("report.noData")}</p>
      ) : (
        <article className="mt-6 overflow-hidden rounded-[var(--radius-panel)] border border-line bg-card">
          <header className="bg-forest p-6 text-white">
            <p className="text-sm text-white/70">{month(r.month)}</p>
            <h2 className="mt-1 text-2xl font-bold">{t("report.title")}</h2>
            <div className="mt-5 flex items-end gap-3">
              <span className="figure-xl text-6xl font-bold">{r.savingsRate}%</span>
              <span className="pb-1 text-white/80">{t("report.savingsRate")}</span>
            </div>
            {r.savingsVsLast !== 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                {r.savingsVsLast > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {t("report.vsLast", { amount: money(Math.abs(r.savingsVsLast)), direction: t(r.savingsVsLast > 0 ? "report.more" : "report.less") })}
              </p>
            )}
          </header>
          <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
            {[
              ["report.income", money(r.income)],
              ["report.expenses", money(r.expenses)],
              ["report.savings", money(r.savings)],
              ["report.largestCategory", r.largestCategory ? t(`categories.${r.largestCategory.categoryKey}`) : "—"],
              ["report.budgetAccuracy", r.budgetAccuracy === null ? "—" : `${r.budgetAccuracy}%`],
              ["report.goalProgress", money(r.goalContributions)],
              ["report.scoreChange", r.healthScore === null ? "—" : r.healthScorePrev === null ? String(r.healthScore) : `${r.healthScorePrev} → ${r.healthScore}`],
              ["report.lessons", String(r.lessonsCompleted)],
            ].map(([k, v]) => (
              <div key={k} className="bg-card p-4">
                <dt className="text-sm text-muted">{t(k!)}</dt>
                <dd className="figure mt-1 text-lg font-bold">{v}</dd>
              </div>
            ))}
            <div className="col-span-2 bg-card p-4 sm:col-span-1">
              <dt className="text-sm text-muted">{t("report.achievements")}</dt>
              <dd className="mt-1 text-lg">{r.badges.length ? r.badges.map((b) => <span key={b} title={badgeByKey(b) ? pick(badgeByKey(b)!.title) : b}>{badgeByKey(b)?.icon}</span>) : "—"}</dd>
            </div>
          </dl>
          <div className="p-4">
            <Button variant="quiet" size="sm" onClick={share}>
              <Share2 className="size-4" /> {t("report.share")}
            </Button>
          </div>
        </article>
      )}
    </div>
  );
}
