import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pause, Play, Archive, ShieldCheck, ChevronRight } from "lucide-react";
import { calculateEmergencyFund, calculateGoalContribution } from "@sakasuru/financial-engine";
import { GOAL_TYPES } from "@sakasuru/validation";
import type { GoalDTO } from "@sakasuru/validation";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useDashboard, useGoals, useMoneyMutation } from "@/lib/queries";
import { Button, EmptyState, MoneyInput, PageHeader, ProgressBar, Section, Segmented, SelectInput, Sheet, Skeleton, TextInput, useToast } from "@/components/ui";
import { cx } from "@/lib/util";

const GOAL_ICON: Record<string, string> = { emergency: "🛡️", laptop: "💻", university: "🎓", wedding: "💍", vehicle: "🛵", house: "🏡", travel: "🧳", business: "🏪", retirement: "🌴", custom: "🎯" };

function GoalCard({ g, onContribute }: { g: GoalDTO; onContribute: () => void }) {
  const { t, money, date } = useI18n();
  const update = useMoneyMutation(({ id, status }: { id: string; status: GoalDTO["status"] }) => api.updateGoal(id, { status }));
  return (
    <li className={cx("rounded-[var(--radius-card)] border border-line bg-card p-5", g.status === "paused" && "opacity-75")}>
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-leaf-50 text-2xl" aria-hidden>
          {GOAL_ICON[g.type] ?? "🎯"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{g.name}</p>
          <p className="text-sm text-muted">
            {t(`goals.types.${g.type}`)}
            {g.deadline ? ` · ${date(g.deadline)}` : ""}
            {g.status === "paused" ? ` · ${t("goals.paused")}` : ""}
          </p>
        </div>
        <span className="figure text-lg font-bold">{Math.round(g.progressPercent)}%</span>
      </div>
      <div className="mt-4">
        <ProgressBar value={g.progressPercent} tone={g.status === "completed" ? "saffron" : "leaf"} label={g.name} />
        <p className="figure mt-2 text-sm text-muted">
          {money(g.saved)} / {money(g.target)}
        </p>
      </div>
      {g.status === "completed" ? (
        <p className="mt-3 font-semibold text-saffron-700">{t("goals.reached")}</p>
      ) : (
        g.monthlyRequired > 0 && <p className="mt-3 rounded-xl bg-surface p-3 text-sm">{t("goals.monthlyNeeded", { amount: money(g.monthlyRequired) })}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {g.status !== "completed" && (
          <Button size="sm" onClick={onContribute}>
            <Plus className="size-4" /> {t("goals.addContribution")}
          </Button>
        )}
        {g.status === "active" && (
          <Button size="sm" variant="quiet" onClick={() => update.mutate({ id: g.id, status: "paused" })}>
            <Pause className="size-4" /> {t("goals.pause")}
          </Button>
        )}
        {g.status === "paused" && (
          <Button size="sm" variant="quiet" onClick={() => update.mutate({ id: g.id, status: "active" })}>
            <Play className="size-4" /> {t("goals.resume")}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: g.id, status: "archived" })}>
          <Archive className="size-4" /> {t("goals.archive")}
        </Button>
      </div>
    </li>
  );
}

export function GoalsPage() {
  const { t } = useI18n();
  const { data: goals, isLoading } = useGoals();
  const [creating, setCreating] = useState(false);
  const [contributing, setContributing] = useState<GoalDTO | null>(null);
  const visible = (goals ?? []).filter((g) => g.status !== "archived");
  const emergency = visible.filter((g) => g.type === "emergency");
  const longTerm = visible.filter((g) => ["house", "retirement", "business"].includes(g.type));
  const savings = visible.filter((g) => !emergency.includes(g) && !longTerm.includes(g));
  return (
    <div>
      <PageHeader title={t("goals.title")} action={<Button onClick={() => setCreating(true)}><Plus className="size-5" /> {t("goals.create")}</Button>} />
      <Link to="/goals/emergency" className="flex items-center gap-4 rounded-[var(--radius-panel)] bg-forest p-5 text-white">
        <ShieldCheck className="size-9 text-saffron-400" />
        <span className="flex-1">
          <span className="block text-lg font-bold">{t("emergency.title")}</span>
          <span className="text-sm text-white/80">{t("emergency.what")}</span>
        </span>
        <ChevronRight className="size-5" />
      </Link>
      {isLoading ? (
        <Skeleton className="mt-6 h-48" />
      ) : !visible.length ? (
        <div className="mt-6">
          <EmptyState icon="🎯" title={t("goals.noGoals")} action={<Button onClick={() => setCreating(true)}>{t("goals.create")}</Button>} />
        </div>
      ) : (
        <>
          {[
            ["goals.emergencyFund", emergency],
            ["goals.savingsGoals", savings],
            ["goals.longTerm", longTerm],
          ].map(([k, list]) =>
            (list as GoalDTO[]).length ? (
              <Section key={k as string} title={t(k as string)}>
                <ul className="grid gap-4 md:grid-cols-2">
                  {(list as GoalDTO[]).map((g) => (
                    <GoalCard key={g.id} g={g} onContribute={() => setContributing(g)} />
                  ))}
                </ul>
              </Section>
            ) : null,
          )}
          <Section title={t("goals.debtGoals")}>
            <Link to="/money?tab=debts" className="flex items-center justify-between rounded-[var(--radius-card)] border border-line bg-card p-4 font-semibold">
              {t("simulator.title")} <ChevronRight className="size-5" />
            </Link>
          </Section>
        </>
      )}
      <CreateGoalSheet open={creating} onClose={() => setCreating(false)} />
      <ContributeSheet goal={contributing} onClose={() => setContributing(null)} />
    </div>
  );
}

export function CreateGoalSheet({ open, onClose, preset }: { open: boolean; onClose: () => void; preset?: { type: string; target: number; name: string } }) {
  const { t, money } = useI18n();
  const toast = useToast();
  const [f, setF] = useState({ name: preset?.name ?? "", type: preset?.type ?? "custom", target: preset ? String(preset.target) : "", saved: "", deadline: "" });
  const add = useMoneyMutation(api.addGoal);
  const preview = useMemo(() => (Number(f.target) && f.deadline ? calculateGoalContribution(Number(f.target), Number(f.saved || 0), new Date(f.deadline + "T00:00:00")) : null), [f]);
  return (
    <Sheet open={open} onClose={onClose} title={t("goals.create")}>
      <div className="flex flex-col gap-4">
        <SelectInput label={t("goals.type")} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, name: f.name || t(`goals.types.${e.target.value}`) })}>
          {GOAL_TYPES.map((g) => (
            <option key={g} value={g}>
              {GOAL_ICON[g]} {t(`goals.types.${g}`)}
            </option>
          ))}
        </SelectInput>
        <TextInput label={t("goals.name")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} />
        <MoneyInput label={t("goals.target")} value={f.target} onChange={(v) => setF({ ...f, target: v })} />
        <MoneyInput label={t("goals.saved")} value={f.saved} onChange={(v) => setF({ ...f, saved: v })} />
        <TextInput label={t("goals.deadline")} type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
        {preview && preview.monthlyRequired > 0 && <p className="rounded-2xl bg-leaf-50 p-4 font-semibold text-leaf-800">{t("goals.monthlyNeeded", { amount: money(preview.monthlyRequired) })}</p>}
        <Button
          loading={add.isPending}
          disabled={!f.name || !Number(f.target)}
          onClick={async () => {
            await add.mutateAsync({ name: f.name, type: f.type as never, target: Number(f.target), saved: Number(f.saved || 0), deadline: f.deadline || null, status: "active" });
            toast(t("common.saved"));
            onClose();
          }}
        >
          {t("goals.create")}
        </Button>
      </div>
    </Sheet>
  );
}

function ContributeSheet({ goal, onClose }: { goal: GoalDTO | null; onClose: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const c = useMoneyMutation(({ id, amount }: { id: string; amount: number }) => api.contribute(id, amount));
  return (
    <Sheet open={!!goal} onClose={onClose} title={goal?.name ?? ""}>
      <div className="flex flex-col gap-4">
        <MoneyInput label={t("goals.contributionAmount")} value={amount} onChange={setAmount} big autoFocus />
        <div className="flex gap-2">
          {[500, 1000, 2500, 5000].map((v) => (
            <button key={v} onClick={() => setAmount(String(v))} className="flex-1 rounded-full border border-line bg-card py-2 text-sm font-semibold hover:border-leaf-300">
              {v.toLocaleString("en-US")}
            </button>
          ))}
        </div>
        <Button
          size="lg"
          loading={c.isPending}
          disabled={!Number(amount)}
          onClick={async () => {
            await c.mutateAsync({ id: goal!.id, amount: Number(amount) });
            toast(t("common.saved"));
            setAmount("");
            onClose();
          }}
        >
          {t("goals.addContribution")}
        </Button>
      </div>
    </Sheet>
  );
}

export function EmergencyFundPage() {
  const { t, money } = useI18n();
  const { data: d } = useDashboard();
  const [essential, setEssential] = useState<string | null>(null);
  const [months, setMonths] = useState<"1" | "3" | "6" | "12">("3");
  const [creating, setCreating] = useState(false);
  const ess = essential ?? String(d?.essentialMonthly || "");
  const r = Number(ess) > 0 ? calculateEmergencyFund(Number(ess), Number(months), d?.emergencyFund ?? 0) : null;
  const coveredMonths = Number(ess) > 0 ? Math.floor(((d?.emergencyFund ?? 0) / Number(ess)) * 10) / 10 : 0;
  const hasGoal = d?.goals.some((g) => g.type === "emergency");
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("emergency.title")} subtitle={t("emergency.what")} back={<Link to="/goals" className="mb-2 inline-block text-sm font-semibold text-leaf-800">← {t("goals.title")}</Link>} />
      <div className="flex flex-col gap-5">
        <MoneyInput label={t("emergency.essential")} hint={d?.essentialMonthly ? t("emergency.fromData") : t("emergency.essentialHint")} value={ess} onChange={setEssential} />
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-soft">{t("emergency.months")}</p>
          <Segmented label={t("emergency.months")} value={months} onChange={setMonths} options={(["1", "3", "6", "12"] as const).map((m) => ({ value: m, label: m === "1" ? t("emergency.oneMonth") : t("emergency.monthsOption", { n: m }) }))} />
        </div>
        {r && (
          <section className="rounded-[var(--radius-panel)] bg-card p-6 shadow-[var(--shadow-lift)]">
            <dl className="grid grid-cols-3 gap-3">
              <div>
                <dt className="text-sm text-muted">{t("emergency.recommended")}</dt>
                <dd className="figure mt-1 text-xl font-bold">{money(r.recommended)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{t("emergency.current")}</dt>
                <dd className="figure mt-1 text-xl font-bold text-leaf-600">{money(r.current)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{t("emergency.remaining")}</dt>
                <dd className="figure mt-1 text-xl font-bold">{money(r.remaining)}</dd>
              </div>
            </dl>
            {/* Clay-pot fill gauge */}
            <div className="mt-6 flex items-center gap-5">
              <svg viewBox="0 0 80 90" className="h-28 w-24 shrink-0" aria-hidden>
                <defs>
                  <clipPath id="pot">
                    <path d="M10 34c0-5 4-9 9-9h42c5 0 9 4 9 9v8c0 22-13 40-30 40S10 64 10 42z" />
                  </clipPath>
                </defs>
                <path d="M10 34c0-5 4-9 9-9h42c5 0 9 4 9 9v8c0 22-13 40-30 40S10 64 10 42z" fill="var(--color-leaf-50)" />
                <rect x="0" y={82 - (57 * r.progressPercent) / 100} width="80" height="90" fill="var(--color-leaf-500)" clipPath="url(#pot)" />
                <rect x="24" y="12" width="32" height="13" rx="6" fill="var(--color-leaf-600)" />
              </svg>
              <div className="flex-1">
                <p className="figure text-4xl font-bold">{r.progressPercent}%</p>
                <p className="mt-1 text-ink-soft">{t("emergency.covered", { n: coveredMonths })}</p>
              </div>
            </div>
            {!hasGoal && (
              <Button className="mt-6 w-full" onClick={() => setCreating(true)}>
                {t("emergency.createGoal")}
              </Button>
            )}
          </section>
        )}
      </div>
      <CreateGoalSheet open={creating} onClose={() => setCreating(false)} preset={{ type: "emergency", target: r?.recommended ?? 0, name: t("goals.types.emergency") }} />
    </div>
  );
}
