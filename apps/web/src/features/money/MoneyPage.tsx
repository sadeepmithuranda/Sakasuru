import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Upload, Trash2, Repeat, Plus } from "lucide-react";
import Papa from "papaparse";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, INCOME_CATEGORIES } from "@sakasuru/financial-engine";
import { parseLocalDate } from "@sakasuru/localization";
import type { TransactionDTO } from "@sakasuru/validation";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useDashboard, useMoneyMutation, useRecurring, useTransactions } from "@/lib/queries";
import { todayIso, cx } from "@/lib/util";
import { Button, Card, ConfirmButton, EmptyState, ErrorState, MoneyInput, PageHeader, ProgressBar, Section, SelectInput, Sheet, Skeleton, Tabs, TextInput, useToast, Segmented } from "@/components/ui";
import { TransactionRow, GROUP_COLORS } from "@/features/home/HomePage";
import { useQuickAdd } from "@/components/layout/AppShell";
import { BudgetTab } from "./BudgetTab";
import { DebtsTab } from "./DebtsTab";
import { ReportTab } from "./ReportTab";

type Tab = "overview" | "transactions" | "budget" | "debts" | "reports";

export function MoneyPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "overview";
  return (
    <div>
      <PageHeader title={t("money.title")} />
      <Tabs
        value={tab}
        onChange={(v) => setParams({ tab: v })}
        tabs={(["overview", "transactions", "budget", "debts", "reports"] as Tab[]).map((v) => ({ value: v, label: t(`money.tabs.${v}`) }))}
      />
      <div className="pt-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "transactions" && <TransactionsTab />}
        {tab === "budget" && <BudgetTab />}
        {tab === "debts" && <DebtsTab />}
        {tab === "reports" && <ReportTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const { t, money } = useI18n();
  const { data: d, isLoading, isError, refetch } = useDashboard();
  if (isLoading) return <Skeleton className="h-64" />;
  if (isError || !d) return <ErrorState message={t("common.error")} onRetry={() => refetch()} retryLabel={t("common.retry")} />;
  const nw = d.needsWants;
  const parts = [
    { k: "needs", v: nw.needsPercent, amount: nw.needs, c: "bg-leaf-600" },
    { k: "wants", v: nw.wantsPercent, amount: nw.wants, c: "bg-saffron-400" },
    { k: "savings", v: nw.savingsPercent, amount: nw.savings, c: "bg-lagoon-500" },
  ];
  const max = Math.max(...d.byGroup.map((g) => g.total), 1);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
        <h2 className="text-lg font-bold">{t("money.needsWants")}</h2>
        <div className="mt-4 flex h-5 overflow-hidden rounded-full bg-leaf-50" aria-hidden>
          {parts.map((p) => (
            <div key={p.k} className={p.c} style={{ width: `${p.v}%` }} />
          ))}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          {parts.map((p) => (
            <div key={p.k}>
              <dt className="flex items-center gap-1.5 text-sm text-muted">
                <span className={cx("size-2.5 rounded-full", p.c)} /> {t(`money.${p.k}`)}
              </dt>
              <dd className="figure mt-1 text-2xl font-bold">{Math.round(p.v)}%</dd>
              <dd className="figure text-sm text-muted">{money(p.amount)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-2xl bg-surface p-3 text-sm text-ink-soft">{t("budget.suggestion")}</p>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
        <h2 className="text-lg font-bold">{t("home.whereMoneyWent")}</h2>
        {d.byGroup.length ? (
          <ul className="mt-4 flex flex-col gap-3">
            {d.byGroup.map((g) => (
              <li key={g.categoryKey}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{t(`groups.${g.categoryKey}`)}</span>
                  <span className="figure">{money(g.total)}</span>
                </div>
                <div className="mt-1.5 h-2.5 rounded-full bg-leaf-50">
                  <div className="h-full rounded-full" style={{ width: `${(g.total / max) * 100}%`, background: GROUP_COLORS[g.categoryKey] }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">{t("money.noTransactionsBody")}</p>
        )}
      </section>
      <div className="lg:col-span-2">
        <RecurringSection />
      </div>
    </div>
  );
}

function RecurringSection() {
  const { t, money, date } = useI18n();
  const { data } = useRecurring();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", categoryKey: "rent", day: "1" });
  const add = useMoneyMutation(api.addRecurring);
  const remove = useMoneyMutation(api.deleteRecurring);
  const toast = useToast();
  return (
    <Section title={t("money.recurring")} className="mt-0" action={<Button size="sm" variant="secondary" onClick={() => setOpen(true)}><Plus className="size-4" /> {t("money.addRecurring")}</Button>}>
      {data?.length ? (
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-4">
          {data.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <Repeat className="size-5 text-muted" aria-hidden />
              <span className="flex-1">
                <span className="block font-semibold">{r.name}</span>
                <span className="text-sm text-muted">{t("money.nextDue", { date: date(r.nextDue) })}</span>
              </span>
              <span className="figure font-semibold">{money(r.amount)}</span>
              <button onClick={() => remove.mutate(r.id)} className="grid size-10 place-items-center rounded-full text-muted hover:bg-alert-50 hover:text-alert-500" aria-label={`${t("common.delete")} ${r.name}`}>
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t("home.noBills")}</p>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title={t("money.addRecurring")}>
        <div className="flex flex-col gap-4">
          <TextInput label={t("goals.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="CEB, Dialog, Rent…" />
          <MoneyInput label={t("expense.amount")} value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
          <SelectInput label={t("expense.category")} value={form.categoryKey} onChange={(e) => setForm({ ...form, categoryKey: e.target.value })}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {t(`categories.${c.key}`)}
              </option>
            ))}
          </SelectInput>
          <TextInput label={t("debts.dueDay")} type="number" min={1} max={31} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} />
          <Button
            loading={add.isPending}
            disabled={!form.name || !Number(form.amount)}
            onClick={async () => {
              await add.mutateAsync({ name: form.name, amount: Number(form.amount), categoryKey: form.categoryKey, dayOfMonth: Math.min(31, Math.max(1, Number(form.day) || 1)), active: true });
              toast(t("common.saved"));
              setOpen(false);
            }}
          >
            {t("common.save")}
          </Button>
        </div>
      </Sheet>
    </Section>
  );
}

type Period = "today" | "week" | "month" | "year" | "all";

function TransactionsTab() {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useTransactions();
  const openAdd = useQuickAdd();
  const [period, setPeriod] = useState<Period>("month");
  const [category, setCategory] = useState("");
  const [method, setMethod] = useState("");
  const [editing, setEditing] = useState<TransactionDTO | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const now = new Date();
    const today = todayIso();
    const from =
      period === "today" ? today : period === "week" ? new Date(now.getTime() - 6 * 86_400_000).toISOString().slice(0, 10) : period === "month" ? today.slice(0, 8) + "01" : period === "year" ? today.slice(0, 4) + "-01-01" : "0000";
    return (data ?? []).filter((x) => x.date >= from && (!category || x.categoryKey === category) && (!method || x.method === method));
  }, [data, period, category, method]);

  if (isLoading) return <Skeleton className="h-64" />;
  if (isError) return <ErrorState message={t("common.error")} onRetry={() => refetch()} retryLabel={t("common.retry")} />;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[280px] flex-1">
          <Segmented label={t("money.filters.month")} value={period} onChange={setPeriod} options={(["today", "week", "month", "year", "all"] as Period[]).map((p) => ({ value: p, label: t(`money.filters.${p}`) }))} />
        </div>
        <Button variant="quiet" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="size-4" /> {t("money.importCsv")}
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <SelectInput label={t("money.filters.category")} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{t("money.filters.all")}</option>
          {[...EXPENSE_CATEGORIES.map((c) => c.key), ...INCOME_CATEGORIES.map((c) => c.key)].map((k) => (
            <option key={k} value={k}>
              {t(`categories.${k}`)}
            </option>
          ))}
        </SelectInput>
        <SelectInput label={t("money.filters.method")} value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">{t("money.filters.all")}</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {t(`methods.${m}`)}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="mt-5">
        {filtered.length ? (
          <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-4">
            {filtered.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onClick={() => setEditing(tx)} />
            ))}
          </div>
        ) : (
          <EmptyState icon="🧾" title={t("money.noTransactions")} body={t("money.noTransactionsBody")} action={<Button onClick={() => openAdd()}>{t("nav.addExpense")}</Button>} />
        )}
      </div>
      <EditTransactionSheet tx={editing} onClose={() => setEditing(null)} />
      <ImportSheet open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

function EditTransactionSheet({ tx, onClose }: { tx: TransactionDTO | null; onClose: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [needWant, setNeedWant] = useState<"need" | "want">("need");
  const [merchant, setMerchant] = useState("");
  const [key, setKey] = useState<string | null>(null);
  if (tx && key !== tx.id) {
    setKey(tx.id);
    setAmount(String(tx.amount));
    setNeedWant(tx.needWant === "want" ? "want" : "need");
    setMerchant(tx.merchant ?? "");
  }
  const update = useMoneyMutation(({ id, body }: { id: string; body: Parameters<typeof api.updateTransaction>[1] }) => api.updateTransaction(id, body));
  const remove = useMoneyMutation(api.deleteTransaction);
  return (
    <Sheet open={!!tx} onClose={onClose} title={t("common.edit")}>
      {tx && (
        <div className="flex flex-col gap-4">
          <p className="text-muted">
            {t(`categories.${tx.categoryKey}`)}
          </p>
          <MoneyInput label={t("expense.amount")} value={amount} onChange={setAmount} />
          <TextInput label={t("expense.merchant")} value={merchant} onChange={(e) => setMerchant(e.target.value)} />
          {tx.type === "expense" && (
            <Segmented label={t("expense.needWant")} value={needWant} onChange={setNeedWant} options={[{ value: "need", label: t("needWant.need") }, { value: "want", label: t("needWant.want") }]} />
          )}
          <div className="flex gap-3">
            <ConfirmButton
              className="h-11 flex-1 border border-alert-500/30 bg-alert-50 px-4 text-alert-500"
              label={t("common.delete")}
              confirmLabel={t("common.confirmDelete")}
              onConfirm={async () => {
                await remove.mutateAsync(tx.id);
                onClose();
              }}
            >
              <Trash2 className="size-4" />
            </ConfirmButton>
            <Button
              className="flex-[2]"
              loading={update.isPending}
              onClick={async () => {
                await update.mutateAsync({ id: tx.id, body: { amount: Number(amount), merchant: merchant || null, ...(tx.type === "expense" ? { needWant } : {}) } });
                toast(t("common.saved"));
                onClose();
              }}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/** CSV import parsed on the device; only rows (date, amount, description, category) are sent. */
function ImportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [rows, setRows] = useState<{ date: string; amount: number; description?: string; categoryKey?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const imp = useMoneyMutation(api.importTransactions);
  const onFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const lower = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.trim().toLowerCase(), v]));
        const parsed = res.data
          .map(lower)
          .map((r) => ({ date: parseLocalDate(r.date ?? "") ?? "", amount: Number(String(r.amount ?? "").replace(/[^\d.-]/g, "")), description: r.description?.slice(0, 120), categoryKey: r.category?.trim() || undefined }))
          .filter((r) => r.date && Number.isFinite(r.amount) && r.amount !== 0);
        setRows(parsed);
        setError(parsed.length ? null : t("common.error"));
      },
    });
  };
  return (
    <Sheet open={open} onClose={onClose} title={t("money.importCsv")}>
      <p className="text-sm text-muted">{t("money.importHelp")}</p>
      <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-line p-6 text-center hover:border-leaf-300">
        <Upload className="size-6 text-leaf-600" />
        <span className="font-semibold">CSV</span>
        <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
      {error && <p className="mt-3 text-sm text-alert-500">{error}</p>}
      {rows.length > 0 && (
        <Button
          className="mt-4 w-full"
          loading={imp.isPending}
          onClick={async () => {
            const n = await imp.mutateAsync(rows);
            toast(t("money.imported", { n }));
            setRows([]);
            onClose();
          }}
        >
          {t("money.importCsv")} ({rows.length})
        </Button>
      )}
    </Sheet>
  );
}

export { Card, ProgressBar };
