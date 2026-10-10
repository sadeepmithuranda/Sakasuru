import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronRight, Info } from "lucide-react";
import {
  calculateGoalContribution,
  calculateCompoundInterest,
  calculateLoanSchedule,
  calculateFixedDeposit,
  calculateEmergencyFund,
  calculateInflationAdjustedValue,
  calculateRetirement,
  calculateDebtPayoff,
  simulateCreditCard,
  compareSimpleAndCompound,
} from "@sakasuru/financial-engine";
import { useI18n } from "@/lib/i18n";
import { monthsLabel } from "@/lib/format";
import { PageHeader, Segmented } from "@/components/ui";
import { cx } from "@/lib/util";

const TOOLS = [
  { id: "savings", icon: "🎯" },
  { id: "compound", icon: "🌱" },
  { id: "loan", icon: "🏦" },
  { id: "housing", icon: "🏡" },
  { id: "vehicle", icon: "🛵" },
  { id: "fd", icon: "🔒" },
  { id: "emergency", icon: "🛡️" },
  { id: "inflation", icon: "🛒" },
  { id: "investment", icon: "📈" },
  { id: "retirement", icon: "🌴" },
  { id: "debtPayoff", icon: "✂️" },
  { id: "creditCard", icon: "💳" },
  { id: "simpleVsCompound", icon: "⚖️" },
] as const;

export function ToolsPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader title={t("tools.title")} subtitle={t("tools.subtitle")} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TOOLS.map((tool) => (
          <li key={tool.id}>
            <Link to={`/tools/${tool.id}`} className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 hover:border-leaf-300">
              <span className="text-3xl" aria-hidden>
                {tool.icon}
              </span>
              <span className="flex items-center justify-between font-bold leading-tight">
                {t(`tools.${tool.id}`)} <ChevronRight className="size-4 shrink-0 text-muted" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Number input + slider pair. Values stay as numbers for the decimal engine. */
function Num({ label, value, onChange, min = 0, max, step = 1, prefix, suffix }: { label: string; value: number; onChange: (n: number) => void; min?: number; max: number; step?: number; prefix?: string; suffix?: string }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink-soft">{label}</span>
        <span className="flex items-center gap-1 rounded-xl border border-line bg-white px-2.5 focus-within:border-leaf-500">
          {prefix && <span className="text-sm text-muted">{prefix}</span>}
          <input
            type="number"
            inputMode="decimal"
            value={Number.isFinite(value) ? value : 0}
            min={min}
            step={step}
            onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
            className="figure h-10 w-28 bg-transparent text-right font-semibold focus:outline-none"
          />
          {suffix && <span className="text-sm text-muted">{suffix}</span>}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={Math.min(value, max)} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" aria-label={label} />
    </label>
  );
}

function Results({ items, children, note }: { items: { label: string; value: string; strong?: boolean }[]; children?: ReactNode; note?: string }) {
  return (
    <section className="rounded-[var(--radius-panel)] bg-white p-5 shadow-[var(--shadow-lift)] lg:sticky lg:top-20">
      <dl className="flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.label} className={cx("flex items-baseline justify-between gap-3", it.strong && "rounded-2xl bg-leaf-50 p-3")}>
            <dt className={cx("text-sm", it.strong ? "font-semibold text-leaf-800" : "text-muted")}>{it.label}</dt>
            <dd className={cx("figure text-right font-bold", it.strong ? "text-2xl text-leaf-800" : "text-lg")}>{it.value}</dd>
          </div>
        ))}
      </dl>
      {children}
      {note && (
        <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
          <Info className="size-4 shrink-0" /> {note}
        </p>
      )}
    </section>
  );
}

function GrowthChart({ data, keys }: { data: Record<string, number>[]; keys: { k: string; color: string; label: string }[] }) {
  const { money } = useI18n();
  return (
    <div className="mt-5 h-52">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid stroke="#E3EEE8" vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickFormatter={(v) => money(v, { compact: true }).replace(/^\S+\s/, "")} tickLine={false} axisLine={false} fontSize={11} width={44} />
          <Tooltip formatter={(v) => money(Number(v))} />
          {keys.map((k) => (
            <Area key={k.k} type="monotone" dataKey={k.k} name={k.label} stroke={k.color} fill={k.color} fillOpacity={0.18} strokeWidth={2.5} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CalculatorPage() {
  const { id = "savings" } = useParams();
  const { t, money } = useI18n();
  const F = (k: string) => t(`tools.fields.${k}`);
  const R = (k: string) => t(`tools.results.${k}`);
  const [v, setV] = useState<Record<string, number>>({});
  const n = (k: string, d: number) => v[k] ?? d;
  const set = (k: string) => (x: number) => setV((s) => ({ ...s, [k]: x }));
  const [mode, setMode] = useState<"simple" | "compound-monthly">("simple");

  const body = useMemo(() => {
    switch (id) {
      case "savings": {
        const months = n("months", 12);
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + months);
        const r = calculateGoalContribution(n("target", 250000), n("saved", 75000), deadline);
        return {
          inputs: [<Num key="a" label={F("target")} value={n("target", 250000)} onChange={set("target")} max={5_000_000} step={5000} prefix="Rs." />, <Num key="b" label={F("saved")} value={n("saved", 75000)} onChange={set("saved")} max={5_000_000} step={5000} prefix="Rs." />, <Num key="c" label={F("months")} value={months} onChange={set("months")} min={1} max={120} />],
          results: [{ label: R("monthlyNeeded"), value: money(r.monthlyRequired), strong: true }, { label: t("emergency.remaining"), value: money(r.remaining) }],
        };
      }
      case "compound":
      case "investment": {
        const r = calculateCompoundInterest({ principal: n("principal", 100000), annualRatePercent: n("rate", 8), years: n("years", 10), monthlyContribution: n("monthly", id === "investment" ? 5000 : 0) });
        return {
          inputs: [
            <Num key="a" label={F("principal")} value={n("principal", 100000)} onChange={set("principal")} max={10_000_000} step={5000} prefix="Rs." />,
            <Num key="b" label={F("monthly")} value={n("monthly", id === "investment" ? 5000 : 0)} onChange={set("monthly")} max={500_000} step={500} prefix="Rs." />,
            <Num key="c" label={id === "investment" ? F("expectedReturn") : F("rate")} value={n("rate", 8)} onChange={set("rate")} max={30} step={0.25} suffix="%" />,
            <Num key="d" label={F("years")} value={n("years", 10)} onChange={set("years")} min={1} max={40} />,
          ],
          results: [{ label: R("finalBalance"), value: money(r.finalBalance), strong: true }, { label: R("contributed"), value: money(r.totalContributed) }, { label: R("interestEarned"), value: money(r.totalInterest) }],
          chart: <GrowthChart data={r.yearly.map((y) => ({ year: y.year, contributed: y.contributed, balance: y.balance }))} keys={[{ k: "balance", color: "#13895F", label: R("finalBalance") }, { k: "contributed", color: "#2E5FA8", label: R("contributed") }]} />,
          note: id === "investment" ? t("common.educationOnly") : t("tools.ratesNote"),
        };
      }
      case "loan":
      case "housing":
      case "vehicle": {
        const defaults = { loan: [500000, 15, 24], housing: [8000000, 13, 240], vehicle: [3500000, 14, 60] }[id]!;
        const price = n("principal", defaults[0]!);
        const down = id === "loan" ? 0 : n("down", Math.round(price * 0.2));
        const principal = Math.max(price - down, 0);
        const months = n("months", defaults[2]!);
        const r = principal > 0 && months > 0 ? calculateLoanSchedule(principal, n("rate", defaults[1]!), months) : null;
        return {
          inputs: [
            <Num key="a" label={id === "loan" ? F("amount") : F("price")} value={price} onChange={set("principal")} max={id === "housing" ? 50_000_000 : 20_000_000} step={10000} prefix="Rs." />,
            ...(id !== "loan" ? [<Num key="b" label={F("downPayment")} value={down} onChange={set("down")} max={price} step={10000} prefix="Rs." />] : []),
            <Num key="c" label={F("rate")} value={n("rate", defaults[1]!)} onChange={set("rate")} max={40} step={0.25} suffix="%" />,
            <Num key="d" label={F("months")} value={months} onChange={set("months")} min={1} max={id === "housing" ? 360 : 120} />,
          ],
          results: r ? [{ label: R("monthlyPayment"), value: money(r.monthlyPayment), strong: true }, { label: R("totalInterest"), value: money(r.totalInterest) }, { label: R("totalPaid"), value: money(r.totalPaid) }] : [],
          note: t("tools.ratesNote"),
        };
      }
      case "fd": {
        const r = calculateFixedDeposit(n("principal", 200000), n("rate", 9), n("months", 12), mode);
        return {
          inputs: [
            <Num key="a" label={F("principal")} value={n("principal", 200000)} onChange={set("principal")} max={10_000_000} step={5000} prefix="Rs." />,
            <Num key="b" label={F("rate")} value={n("rate", 9)} onChange={set("rate")} max={25} step={0.25} suffix="%" />,
            <Num key="c" label={F("months")} value={n("months", 12)} onChange={set("months")} min={1} max={60} />,
            <div key="d">
              <p className="mb-2 text-sm font-semibold text-ink-soft">{F("mode")}</p>
              <Segmented label={F("mode")} value={mode} onChange={setMode} options={[{ value: "simple", label: F("simple") }, { value: "compound-monthly", label: F("compound") }]} />
            </div>,
          ],
          results: [{ label: R("maturity"), value: money(r.maturityValue), strong: true }, { label: R("interestEarned"), value: money(r.interestEarned) }],
          note: t("tools.ratesNote"),
        };
      }
      case "emergency": {
        const r = calculateEmergencyFund(n("amount", 55000), Math.max(1, Math.round(n("months", 3))), n("saved", 80000));
        return {
          inputs: [<Num key="a" label={t("emergency.essential")} value={n("amount", 55000)} onChange={set("amount")} max={1_000_000} step={1000} prefix="Rs." />, <Num key="b" label={t("emergency.months")} value={n("months", 3)} onChange={set("months")} min={1} max={12} />, <Num key="c" label={t("emergency.current")} value={n("saved", 80000)} onChange={set("saved")} max={5_000_000} step={1000} prefix="Rs." />],
          results: [{ label: t("emergency.recommended"), value: money(r.recommended), strong: true }, { label: t("emergency.remaining"), value: money(r.remaining) }, { label: "%", value: `${r.progressPercent}%` }],
        };
      }
      case "inflation": {
        const r = calculateInflationAdjustedValue(n("amount", 10000), n("rate", 5), Math.round(n("years", 10)));
        return {
          inputs: [<Num key="a" label={F("price")} value={n("amount", 10000)} onChange={set("amount")} max={1_000_000} step={500} prefix="Rs." />, <Num key="b" label={F("inflation")} value={n("rate", 5)} onChange={set("rate")} max={30} step={0.5} suffix="%" />, <Num key="c" label={F("years")} value={n("years", 10)} onChange={set("years")} min={1} max={30} />],
          results: [
            ...[1, 5, 10].filter((y) => y <= r.points.length - 1).map((y) => ({ label: `${y} ${F("years")}`, value: money(r.points[y]!.cost) })),
            { label: R("futureCost"), value: money(r.futureCost), strong: true },
            { label: R("purchasingPower"), value: money(r.purchasingPowerOfToday) },
          ],
          chart: <GrowthChart data={r.points.map((p) => ({ year: p.year, cost: p.cost }))} keys={[{ k: "cost", color: "#B45309", label: R("futureCost") }]} />,
          note: t("tools.inflationNote"),
        };
      }
      case "retirement": {
        const r = calculateRetirement({ currentAge: n("age", 28), retirementAge: n("retire", 60), currentSavings: n("principal", 200000), monthlyContribution: n("monthly", 8000), annualReturnPercent: n("rate", 8), annualInflationPercent: n("infl", 5) });
        return {
          inputs: [
            <Num key="a" label={F("currentAge")} value={n("age", 28)} onChange={set("age")} min={16} max={70} />,
            <Num key="b" label={F("retireAge")} value={n("retire", 60)} onChange={set("retire")} min={40} max={75} />,
            <Num key="c" label={F("principal")} value={n("principal", 200000)} onChange={set("principal")} max={20_000_000} step={10000} prefix="Rs." />,
            <Num key="d" label={F("monthly")} value={n("monthly", 8000)} onChange={set("monthly")} max={500_000} step={500} prefix="Rs." />,
            <Num key="e" label={F("expectedReturn")} value={n("rate", 8)} onChange={set("rate")} max={20} step={0.25} suffix="%" />,
            <Num key="f" label={F("inflation")} value={n("infl", 5)} onChange={set("infl")} max={20} step={0.25} suffix="%" />,
          ],
          results: [{ label: R("nominal"), value: money(r.nominalValue), strong: true }, { label: R("real"), value: money(r.valueInTodaysRupees) }],
          chart: <GrowthChart data={r.yearly.map((y) => ({ year: y.year, balance: y.balance }))} keys={[{ k: "balance", color: "#13895F", label: R("nominal") }]} />,
          note: t("common.educationOnly"),
        };
      }
      case "debtPayoff": {
        const r = calculateDebtPayoff(n("balance", 300000), n("rate", 18), n("payment", 15000));
        return {
          inputs: [<Num key="a" label={F("balance")} value={n("balance", 300000)} onChange={set("balance")} max={10_000_000} step={5000} prefix="Rs." />, <Num key="b" label={F("rate")} value={n("rate", 18)} onChange={set("rate")} max={60} step={0.5} suffix="%" />, <Num key="c" label={F("payment")} value={n("payment", 15000)} onChange={set("payment")} max={500_000} step={500} prefix="Rs." />],
          results: r.paysOff ? [{ label: R("monthsToPay"), value: monthsLabel(t, r.months), strong: true }, { label: R("totalInterest"), value: money(r.totalInterest) }, { label: R("totalPaid"), value: money(r.totalPaid) }] : [{ label: R("monthsToPay"), value: R("never"), strong: true }],
          note: r.paysOff ? undefined : t("debts.neverPays"),
        };
      }
      case "creditCard": {
        const r = simulateCreditCard({ balance: n("balance", 100000), annualRatePercent: n("rate", 28), minimumPercent: n("minPct", 5), minimumFloor: n("floor", 1000), fixedPayment: n("fixed", 10000) });
        return {
          inputs: [
            <Num key="a" label={t("creditCard.balance")} value={n("balance", 100000)} onChange={set("balance")} max={2_000_000} step={5000} prefix="Rs." />,
            <Num key="b" label={t("creditCard.rate")} value={n("rate", 28)} onChange={set("rate")} max={60} step={0.5} suffix="%" />,
            <Num key="c" label={t("creditCard.minPercent")} value={n("minPct", 5)} onChange={set("minPct")} min={1} max={20} step={0.5} suffix="%" />,
            <Num key="d" label={t("creditCard.minFloor")} value={n("floor", 1000)} onChange={set("floor")} max={10000} step={100} prefix="Rs." />,
            <Num key="e" label={t("creditCard.fixed")} value={n("fixed", 10000)} onChange={set("fixed")} max={500_000} step={500} prefix="Rs." />,
          ],
          results: [
            { label: t("creditCard.minimumOnly"), value: monthsLabel(t, r.minimumOnly.months) },
            { label: t("creditCard.interestCost", { amount: "" }).replace(/[:\s]+$/, ""), value: money(r.minimumOnly.totalInterest) },
            { label: t("creditCard.fixedPay", { amount: money(n("fixed", 10000)) }), value: r.fixed?.paysOff ? monthsLabel(t, r.fixed.months) : R("never"), strong: true },
            { label: t("creditCard.interestCost", { amount: "" }).replace(/[:\s]+$/, ""), value: money(r.fixed?.totalInterest ?? 0) },
          ],
          banner: t("creditCard.highlight"),
          note: t("creditCard.useYourRate"),
        };
      }
      case "simpleVsCompound": {
        const r = compareSimpleAndCompound(n("principal", 100000), n("rate", 10), Math.round(n("years", 10)));
        return {
          inputs: [<Num key="a" label={F("principal")} value={n("principal", 100000)} onChange={set("principal")} max={10_000_000} step={5000} prefix="Rs." />, <Num key="b" label={F("rate")} value={n("rate", 10)} onChange={set("rate")} max={30} step={0.25} suffix="%" />, <Num key="c" label={F("years")} value={n("years", 10)} onChange={set("years")} min={1} max={40} />],
          results: [{ label: R("simpleTotal"), value: money(r.simpleTotal) }, { label: R("compoundTotal"), value: money(r.compoundTotal), strong: true }, { label: R("difference"), value: money(r.difference) }],
        };
      }
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, v, mode, t, money]);

  if (!body) return <p>{t("common.notFound")}</p>;
  const b = body as { inputs: ReactNode[]; results: { label: string; value: string; strong?: boolean }[]; chart?: ReactNode; note?: string; banner?: string };
  return (
    <div>
      <PageHeader title={t(`tools.${id}`)} back={<Link to="/tools" className="mb-2 inline-block text-sm font-semibold text-leaf-800">← {t("tools.title")}</Link>} />
      {b.banner && <p className="mb-5 rounded-2xl bg-saffron-100 p-4 text-lg font-bold text-saffron-700">{b.banner}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6 rounded-[var(--radius-card)] border border-line bg-white p-5">{b.inputs}</div>
        <Results items={b.results} note={b.note}>
          {b.chart}
        </Results>
      </div>
      <p className="mt-6 text-xs text-muted">{t("tools.subtitle")}</p>
    </div>
  );
}
