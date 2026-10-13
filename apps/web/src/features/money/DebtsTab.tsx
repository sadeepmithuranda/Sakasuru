import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { DEBT_TYPES } from "@sakasuru/validation";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useDashboard, useDebts, useMoneyMutation } from "@/lib/queries";
import { monthsLabel } from "@/lib/format";
import { Button, ConfirmButton, EmptyState, MoneyInput, Section, Segmented, SelectInput, Sheet, Skeleton, TextInput, useToast } from "@/components/ui";
import { cx } from "@/lib/util";

export function DebtsTab() {
  const { t, money } = useI18n();
  const { data: debts, isLoading } = useDebts();
  const { data: d } = useDashboard();
  const [open, setOpen] = useState(false);
  const remove = useMoneyMutation(api.deleteDebt);
  if (isLoading) return <Skeleton className="h-64" />;
  return (
    <div>
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line">
        <div className="bg-card p-4">
          <dt className="text-sm text-muted">{t("debts.totalDebt")}</dt>
          <dd className="figure mt-1 text-xl font-bold">{money(d?.debtTotals.total ?? 0)}</dd>
        </div>
        <div className="bg-card p-4">
          <dt className="text-sm text-muted">{t("debts.monthlyPayments")}</dt>
          <dd className="figure mt-1 text-xl font-bold">{money(d?.debtTotals.monthly ?? 0)}</dd>
        </div>
        <div className="bg-card p-4">
          <dt className="text-sm text-muted" title={t("debts.dtiHint")}>
            {t("debts.dti")}
          </dt>
          <dd className={cx("figure mt-1 text-xl font-bold", (d?.debtTotals.dti ?? 0) > 40 ? "text-alert-500" : (d?.debtTotals.dti ?? 0) > 25 ? "text-amber-600" : "")}>{d?.debtTotals.dti ?? 0}%</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted">{t("debts.dtiHint")}</p>

      <Section title={t("debts.title")} action={<Button size="sm" variant="secondary" onClick={() => setOpen(true)}><Plus className="size-4" /> {t("debts.add")}</Button>}>
        {debts?.length ? (
          <ul className="flex flex-col gap-3">
            {debts.map((x) => (
              <li key={x.id} className="rounded-[var(--radius-card)] border border-line bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-bold">{x.lender || t(`debts.types.${x.type}`)}</p>
                    <p className="text-sm text-muted">
                      {t(`debts.types.${x.type}`)} · {x.ratePercent}% · {money(x.monthlyPayment)}
                      {t("common.perMonth")}
                    </p>
                  </div>
                  <p className="figure text-lg font-bold">{money(x.balance)}</p>
                  <ConfirmButton iconOnly onConfirm={() => remove.mutate(x.id)} label={t("common.delete")} confirmLabel={t("common.delete") + "?"} className="h-9 min-w-9 text-muted hover:bg-alert-50 hover:text-alert-500">
                    <Trash2 className="size-4" />
                  </ConfirmButton>
                </div>
                {x.payoffMonths === null ? (
                  <p className="mt-3 rounded-xl bg-alert-50 p-3 text-sm font-medium text-alert-500">{t("debts.neverPays")}</p>
                ) : (
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-muted">{t("debts.payoffDate")}</dt>
                      <dd className="font-semibold">{monthsLabel(t, x.payoffMonths)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t("debts.totalInterest")}</dt>
                      <dd className="figure font-semibold">{money(x.totalInterest)}</dd>
                    </div>
                  </dl>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="🕊️" title={t("debts.none")} />
        )}
      </Section>

      {!!debts?.length && <Simulator />}

      <Link to="/tools/creditCard" className="mt-8 flex items-center gap-4 rounded-[var(--radius-card)] bg-lagoon-50 p-5">
        <CreditCard className="size-7 text-lagoon-700" />
        <span>
          <span className="block font-bold">{t("creditCard.title")}</span>
          <span className="text-sm text-lagoon-700">{t("creditCard.highlight")}</span>
        </span>
      </Link>
      <AddDebtSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function Simulator() {
  const { t, money, date } = useI18n();
  const [extra, setExtra] = useState(5000);
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("avalanche");
  const { data: debts } = useDebts();
  const { data: sim } = useQuery({ queryKey: ["simulate", extra, debts?.length], queryFn: () => api.simulateDebts(extra), placeholderData: (p) => p });
  const s = sim?.[strategy];
  const base = sim ? sim.perDebt.reduce((a, p) => Math.max(a, p.current.months ?? 0), 0) : 0;
  return (
    <section className="mt-8 rounded-[var(--radius-panel)] border border-line bg-card p-5 sm:p-6">
      <h2 className="text-xl font-bold">{t("simulator.title")}</h2>
      <div className="mt-4">
        <Segmented
          label={t("simulator.title")}
          value={strategy}
          onChange={setStrategy}
          options={[
            { value: "snowball", label: t("simulator.snowball") },
            { value: "avalanche", label: t("simulator.avalanche") },
          ]}
        />
        <p className="mt-2 text-sm text-muted">{t(strategy === "snowball" ? "simulator.snowballDesc" : "simulator.avalancheDesc")}</p>
      </div>
      <label className="mt-5 block">
        <span className="font-semibold">{t("simulator.extraQuestion", { amount: money(extra) })}</span>
        <input type="range" min={0} max={50000} step={500} value={extra} onChange={(e) => setExtra(Number(e.target.value))} className="mt-3 w-full" aria-valuetext={money(extra)} />
      </label>
      {sim && s && (
        <>
          {s.months === null ? (
            <p className="mt-4 rounded-xl bg-alert-50 p-3 text-sm text-alert-500">{t("simulator.cannotCover")}</p>
          ) : (
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-surface p-4">
                <dt className="text-sm text-muted">{t("simulator.currentPayoff")}</dt>
                <dd className="mt-1 font-bold">{monthsLabel(t, base || null)}</dd>
              </div>
              <div className="rounded-2xl bg-leaf-50 p-4">
                <dt className="text-sm text-leaf-800">{t("simulator.newPayoff")}</dt>
                <dd className="mt-1 font-bold text-leaf-800">{monthsLabel(t, s.months)}</dd>
                {base > s.months && <dd className="text-sm font-semibold text-leaf-600">{t("simulator.monthsSooner", { n: base - s.months })}</dd>}
              </div>
              <div className="rounded-2xl bg-saffron-100 p-4">
                <dt className="text-sm text-saffron-700">{t("simulator.interestSaved")}</dt>
                <dd className="figure mt-1 font-bold">{money(Math.max(0, sim.perDebt.reduce((a, p) => a + (p.current.totalInterest ?? 0), 0) - s.totalInterest))}</dd>
              </div>
            </dl>
          )}
          <h3 className="mt-6 font-bold">{t("simulator.order")}</h3>
          <ol className="mt-2 flex flex-col gap-2">
            {s.order.map((o, i) => (
              <li key={o.id} className="flex items-center gap-3 text-sm">
                <span className="grid size-7 place-items-center rounded-full bg-leaf-100 font-bold text-leaf-800">{i + 1}</span>
                <span className="flex-1 font-semibold">{debts?.find((d) => d.id === o.id)?.lender || t(`debts.types.${debts?.find((d) => d.id === o.id)?.type ?? "other"}`)}</span>
                <span className="text-muted">{o.paidOffMonth ? t("simulator.paidMonth", { n: o.paidOffMonth }) : "—"}</span>
              </li>
            ))}
          </ol>
          {sim.perDebt[0]?.improved.payoffDate && <p className="mt-3 text-xs text-muted">{date(sim.perDebt[0].improved.payoffDate)}</p>}
        </>
      )}
      <p className="mt-5 text-xs leading-relaxed text-muted">{t("simulator.disclaimer")}</p>
    </section>
  );
}

function AddDebtSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [f, setF] = useState({ type: "personal", lender: "", balance: "", rate: "", payment: "", term: "", dueDay: "" });
  const add = useMoneyMutation(api.addDebt);
  return (
    <Sheet open={open} onClose={onClose} title={t("debts.add")}>
      <div className="flex flex-col gap-4">
        <SelectInput label={t("debts.type")} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {DEBT_TYPES.map((x) => (
            <option key={x} value={x}>
              {t(`debts.types.${x}`)}
            </option>
          ))}
        </SelectInput>
        <TextInput label={t("debts.lender")} value={f.lender} onChange={(e) => setF({ ...f, lender: e.target.value })} maxLength={60} />
        <MoneyInput label={t("debts.balance")} value={f.balance} onChange={(v) => setF({ ...f, balance: v })} />
        <TextInput label={t("debts.rate")} inputMode="decimal" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value.replace(/[^\d.]/g, "") })} />
        <MoneyInput label={t("debts.payment")} value={f.payment} onChange={(v) => setF({ ...f, payment: v })} />
        <div className="grid grid-cols-2 gap-3">
          <TextInput label={t("debts.term")} type="number" min={0} value={f.term} onChange={(e) => setF({ ...f, term: e.target.value })} />
          <TextInput label={t("debts.dueDay")} type="number" min={1} max={31} value={f.dueDay} onChange={(e) => setF({ ...f, dueDay: e.target.value })} />
        </div>
        <Button
          loading={add.isPending}
          disabled={!Number(f.balance) || f.rate === ""}
          onClick={async () => {
            await add.mutateAsync({ type: f.type as never, lender: f.lender || null, balance: Number(f.balance), ratePercent: Number(f.rate), monthlyPayment: Number(f.payment || 0), remainingMonths: f.term ? Number(f.term) : null, dueDay: f.dueDay ? Number(f.dueDay) : null });
            toast(t("common.saved"));
            onClose();
          }}
        >
          {t("common.save")}
        </Button>
      </div>
    </Sheet>
  );
}
