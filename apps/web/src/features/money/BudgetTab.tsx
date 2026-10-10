import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { summariseBudget, budgetProgress, EXPENSE_CATEGORIES } from "@sakasuru/financial-engine";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useBudget, useMoneyMutation, useTransactions } from "@/lib/queries";
import { thisMonth, cx } from "@/lib/util";
import { Button, EmptyState, MoneyInput, ProgressBar, Skeleton, useToast } from "@/components/ui";

const BUDGET_KEYS = ["rent", "groceries", "eatingOut", "bus", "fuel", "electricity", "water", "internet", "mobileReload", "tuition", "medical", "loanInstalment", "insurance", "familyContribution", "entertainment", "shopping", "subscriptions", "other", "savings", "investments"];
const icon = (k: string) => (k === "savings" ? "🐷" : k === "investments" ? "📈" : (EXPENSE_CATEGORIES.find((c) => c.key === k)?.icon ?? "📦"));

export function BudgetTab() {
  const { t, money, month } = useI18n();
  const m = thisMonth();
  const { data: budget, isLoading } = useBudget(m);
  const { data: txs } = useTransactions();
  const [editing, setEditing] = useState(false);

  const monthExpenses = useMemo(() => (txs ?? []).filter((x) => x.type === "expense" && x.date.startsWith(m)), [txs, m]);
  if (isLoading) return <Skeleton className="h-64" />;
  if (editing || !budget) {
    if (!budget && !editing)
      return <EmptyState icon="💰" title={t("home.noBudget")} body={t("budget.suggestion")} action={<Button onClick={() => setEditing(true)}>{t("budget.create")}</Button>} />;
    return <BudgetEditor month={m} onDone={() => setEditing(false)} />;
  }

  const lines = budget.items.filter((i) => i.categoryKey !== "savings" && i.categoryKey !== "investments");
  const progress = budgetProgress(lines, monthExpenses);
  const summary = summariseBudget(budget.income, budget.items);
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold">{month(m)}</h2>
          <p className="text-muted">{t("budget.title")}</p>
        </div>
        <Button variant="quiet" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="size-4" /> {t("budget.edit")}
        </Button>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-4">
        {[
          ["budget.totalIncome", money(summary.totalIncome)],
          ["budget.totalExpenses", money(summary.totalPlannedExpenses)],
          ["budget.plannedSavings", money(summary.plannedSavings)],
          ["budget.savingsRate", `${summary.savingsRate}%`],
        ].map(([k, v]) => (
          <div key={k} className="bg-white p-4">
            <dt className="text-sm text-muted">{t(k!)}</dt>
            <dd className="figure mt-1 text-xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-6 flex flex-col gap-4">
        {progress.map((p) => (
          <li key={p.categoryKey} className="rounded-[var(--radius-card)] border border-line bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {icon(p.categoryKey)}
              </span>
              <span className="flex-1 font-semibold">{t(`categories.${p.categoryKey}`)}</span>
              <span className={cx("rounded-full px-2.5 py-1 text-xs font-semibold", p.status === "over" ? "bg-alert-50 text-alert-500" : p.status === "near" ? "bg-amber-50 text-amber-600" : "bg-leaf-50 text-leaf-800")}>{t(`budget.status.${p.status}`)}</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={p.percentUsed} tone={p.status === "over" ? "alert" : p.status === "near" ? "amber" : "leaf"} label={t(`categories.${p.categoryKey}`)} />
            </div>
            <div className="figure mt-2 flex justify-between text-sm text-muted">
              <span>
                {money(p.spent)} / {money(p.planned)}
              </span>
              <span className={p.remaining < 0 ? "font-semibold text-alert-500" : ""}>{p.remaining < 0 ? t("budget.over", { amount: money(-p.remaining) }) : t("budget.left", { amount: money(p.remaining) })}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BudgetEditor({ month, onDone }: { month: string; onDone: () => void }) {
  const { t, money } = useI18n();
  const toast = useToast();
  const { data: budget } = useBudget(month);
  const [income, setIncome] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (budget) {
      setIncome(String(budget.income || ""));
      setValues(Object.fromEntries(budget.items.map((i) => [i.categoryKey, String(i.planned)])));
    }
  }, [budget]);
  const items = BUDGET_KEYS.map((k) => ({ categoryKey: k, planned: Number(values[k] || 0) }));
  const summary = summariseBudget(Number(income || 0), items);
  const save = useMoneyMutation((b: Parameters<typeof api.saveBudget>[1]) => api.saveBudget(month, b));
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <MoneyInput label={t("budget.income")} value={income} onChange={setIncome} big />
        <p className="rounded-2xl bg-saffron-100 p-3 text-sm text-saffron-700">{t("budget.suggestion")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {BUDGET_KEYS.map((k) => (
            <MoneyInput key={k} label={`${icon(k)} ${t(`categories.${k}`)}`} value={values[k] ?? ""} onChange={(v) => setValues({ ...values, [k]: v })} />
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-[var(--radius-card)] border border-line bg-white p-5 lg:sticky lg:top-20">
        <dl className="flex flex-col gap-3">
          {[
            ["budget.totalIncome", summary.totalIncome],
            ["budget.totalExpenses", summary.totalPlannedExpenses],
            ["budget.plannedSavings", summary.plannedSavings],
            ["budget.remaining", summary.remaining],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between">
              <dt className="text-muted">{t(k as string)}</dt>
              <dd className={cx("figure font-semibold", (v as number) < 0 && "text-alert-500")}>{money(v as number)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-line pt-3">
            <dt className="font-semibold">{t("budget.savingsRate")}</dt>
            <dd className="figure text-xl font-bold text-leaf-600">{summary.savingsRate}%</dd>
          </div>
        </dl>
        {summary.remaining < 0 && <p className="mt-3 text-sm text-alert-500">{t("budget.overWarning", { amount: money(-summary.remaining) })}</p>}
        <div className="mt-5 flex gap-2">
          {budget && (
            <Button variant="quiet" className="flex-1" onClick={onDone}>
              {t("common.cancel")}
            </Button>
          )}
          <Button
            className="flex-[2]"
            loading={save.isPending}
            onClick={async () => {
              await save.mutateAsync({ income: Number(income || 0), items: items.filter((i) => i.planned > 0) });
              toast(t("common.saved"));
              onDone();
            }}
          >
            {t("common.save")}
          </Button>
        </div>
      </aside>
    </div>
  );
}
