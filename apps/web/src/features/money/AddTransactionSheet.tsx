import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, suggestNeedWant, type NeedWant } from "@sakasuru/financial-engine";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useMoneyMutation, useTransactions } from "@/lib/queries";
import { todayIso, cx } from "@/lib/util";
import { Button, MoneyInput, Segmented, Sheet, TextInput, SelectInput, Toggle, useToast } from "@/components/ui";

const DEFAULT_QUICK = ["groceries", "eatingOut", "bus", "threeWheeler", "fuel", "mobileReload", "electricity", "shopping"];

/** Expense entry built for speed: amount → category → save, in under 5 seconds. */
export function AddTransactionSheet({ open, onClose, type: initialType }: { open: boolean; onClose: () => void; type: "expense" | "income" }) {
  const { t } = useI18n();
  const toast = useToast();
  const { data: history } = useTransactions();
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [merchant, setMerchant] = useState("");
  const [more, setMore] = useState(false);
  const [date, setDate] = useState(todayIso());
  const [method, setMethod] = useState<string>("cash");
  const [needWant, setNeedWant] = useState<NeedWant | null>(null);
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setType(initialType);
      setAmount("");
      setCategory(null);
      setMerchant("");
      setMore(false);
      setDate(todayIso());
      setNeedWant(null);
      setNotes("");
      setRecurring(false);
      setError(null);
    }
  }, [open, initialType]);

  // Most-used categories first, so frequent entries take one tap.
  const quick = useMemo(() => {
    if (type === "income") return INCOME_CATEGORIES.map((c) => c.key as string);
    const counts = new Map<string, number>();
    for (const tx of history ?? []) if (tx.type === "expense") counts.set(tx.categoryKey, (counts.get(tx.categoryKey) ?? 0) + 1);
    const used = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
    return [...new Set([...used, ...DEFAULT_QUICK])].slice(0, 8);
  }, [history, type]);

  const save = useMoneyMutation(api.addTransaction);
  const icon = (key: string) => EXPENSE_CATEGORIES.find((c) => c.key === key)?.icon ?? INCOME_CATEGORIES.find((c) => c.key === key)?.icon ?? "📦";
  const effectiveNW = needWant ?? (category ? suggestNeedWant(category) : "need");

  const submit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return setError(t("expense.amountRequired"));
    const cat = category ?? (type === "income" ? "salary" : "other");
    try {
      await save.mutateAsync({ type, amount: value, categoryKey: cat, date, merchant: merchant || null, method: type === "expense" ? (method as never) : null, notes: notes || null, needWant: type === "expense" ? effectiveNW : null, recurring });
      toast(t(type === "income" ? "expense.incomeSaved" : "expense.saved"));
      onClose();
    } catch {
      toast(t("common.error"), "error");
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={t(type === "income" ? "expense.incomeTitle" : "expense.title")}>
      <div className="flex flex-col gap-4">
        <Segmented
          label={t("expense.title")}
          value={type}
          onChange={(v) => {
            setType(v);
            setCategory(null);
          }}
          options={[
            { value: "expense", label: t("money.totalExpenses") },
            { value: "income", label: t("money.totalIncome") },
          ]}
        />
        <MoneyInput label={t("expense.amount")} value={amount} onChange={(v) => (setAmount(v), setError(null))} error={error} autoFocus big />

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-soft">{t("expense.category")}</legend>
          <div className="grid grid-cols-4 gap-2">
            {quick.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setCategory(k)}
                aria-pressed={category === k}
                className={cx("flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 text-center text-xs font-semibold leading-tight", category === k ? "border-brand-500 bg-brand-50 text-brand-800" : "border-line bg-card")}
              >
                <span className="text-2xl" aria-hidden>
                  {icon(k)}
                </span>
                <span className="line-clamp-2">{t(`categories.${k}`)}</span>
              </button>
            ))}
          </div>
          {type === "expense" && (
            <SelectInput label={t("money.filters.category")} value={category && !quick.includes(category) ? category : ""} onChange={(e) => setCategory(e.target.value || null)} className="mt-2">
              <option value="">{t("common.seeAll")}…</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.icon} {t(`categories.${c.key}`)}
                </option>
              ))}
            </SelectInput>
          )}
        </fieldset>

        <TextInput label={t(type === "income" ? "expense.source" : "expense.merchant")} placeholder={t("expense.merchantPlaceholder")} value={merchant} onChange={(e) => setMerchant(e.target.value)} maxLength={80} />

        <button type="button" onClick={() => setMore((m) => !m)} className="flex items-center gap-1 self-start text-sm font-semibold text-brand-800" aria-expanded={more}>
          <ChevronDown className={cx("size-4 transition-transform", more && "rotate-180")} /> {t("expense.more")}
        </button>

        {more && (
          <div className="flex flex-col gap-4">
            <TextInput label={t("expense.date")} type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />
            {type === "expense" && (
              <>
                <SelectInput label={t("expense.method")} value={method} onChange={(e) => setMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {t(`methods.${m}`)}
                    </option>
                  ))}
                </SelectInput>
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-ink-soft">{t("expense.needWant")}</p>
                  <Segmented
                    label={t("expense.needWant")}
                    value={effectiveNW === "saving" ? "need" : effectiveNW}
                    onChange={(v) => setNeedWant(v)}
                    options={[
                      { value: "need", label: t("needWant.need") },
                      { value: "want", label: t("needWant.want") },
                    ]}
                  />
                  <p className="mt-1.5 text-xs text-muted">{t("expense.needWantHint")}</p>
                </div>
                <Toggle checked={recurring} onChange={setRecurring} label={t("expense.recurring")} />
              </>
            )}
            <TextInput label={t("expense.notes")} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
          </div>
        )}

        <Button size="lg" onClick={submit} loading={save.isPending} className="w-full">
          {t("common.save")}
        </Button>
      </div>
    </Sheet>
  );
}
