import { Link } from "react-router-dom";
import { Plus, Lightbulb, CalendarClock, ChevronRight, Flame, BookOpen } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CHALLENGES } from "@sakasuru/content";
import { EXPENSE_CATEGORIES, getCategory } from "@sakasuru/financial-engine";
import { greetingKey } from "@sakasuru/localization";
import type { DashboardDTO, TransactionDTO } from "@sakasuru/validation";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/api-context";
import { useCourses, useDashboard, useLearning } from "@/lib/queries";
import { renderInsight } from "@/lib/format";
import { useQuickAdd } from "@/components/layout/AppShell";
import { PetalScore } from "@/components/brand";
import { Button, ErrorState, ProgressBar, Section, Skeleton } from "@/components/ui";
import { cx } from "@/lib/util";

const GROUP_COLORS: Record<string, string> = {
  food: "#13895F",
  transport: "#2E5FA8",
  housing: "var(--color-leaf-800)",
  utilities: "#F2B705",
  education: "#6B46C1",
  healthcare: "#B42318",
  entertainment: "#D53F8C",
  shopping: "#ED8936",
  loans: "var(--color-ink-soft)",
  insurance: "#2C7A7B",
  subscriptions: "#B83280",
  family: "#7BC4A4",
  other: "#A0AEC0",
};

export function TransactionRow({ tx, onClick }: { tx: TransactionDTO; onClick?: () => void }) {
  const { t, money, date } = useI18n();
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === tx.categoryKey);
  const Comp = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface text-xl" aria-hidden>
        {tx.type === "income" ? "💰" : (cat?.icon ?? "📦")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{tx.merchant || t(`categories.${tx.categoryKey}`)}</span>
        <span className="block truncate text-sm text-muted">
          {t(`categories.${tx.categoryKey}`)} · {date(tx.date)}
          {tx.needWant && tx.type === "expense" ? ` · ${t(`needWant.${tx.needWant}`)}` : ""}
        </span>
      </span>
      <span className={cx("figure shrink-0 font-semibold", tx.type === "income" ? "text-leaf-600" : "text-ink")}>
        {tx.type === "income" ? "+" : "−"}
        {money(tx.amount).replace("-", "")}
      </span>
    </Comp>
  );
}

function SpendingDonut({ d }: { d: DashboardDTO }) {
  const { t, money } = useI18n();
  const data = d.byGroup.map((g) => ({ key: g.categoryKey, name: t(`groups.${g.categoryKey}`), value: g.total, percent: g.percent }));
  if (!data.length) return <p className="text-sm text-muted">{t("money.noTransactionsBody")}</p>;
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[200px_1fr]">
      <div className="relative mx-auto h-[200px] w-[200px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={94} paddingAngle={2} strokeWidth={0} isAnimationActive={false}>
              {data.map((e) => (
                <Cell key={e.key} fill={GROUP_COLORS[e.key] ?? "#A0AEC0"} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => money(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-xs text-muted">{t("home.spent")}</span>
          <span className="figure text-lg font-bold">{money(d.spent, { compact: true })}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {data.slice(0, 6).map((e) => (
          <li key={e.key} className="flex items-center gap-2.5 text-sm">
            <span className="size-3 shrink-0 rounded-full" style={{ background: GROUP_COLORS[e.key] }} aria-hidden />
            <span className="flex-1 truncate">{e.name}</span>
            <span className="figure font-semibold">{money(e.value)}</span>
            <span className="figure w-11 text-right text-muted">{Math.round(e.percent)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HomePage() {
  const { t, money, pick, date } = useI18n();
  const { me } = useSession();
  const { data: d, isLoading, isError, refetch } = useDashboard();
  const { data: learning } = useLearning();
  const { data: courses } = useCourses();
  const openAdd = useQuickAdd();

  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-72" />
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  if (isError || !d) return <ErrorState message={t("common.error")} onRetry={() => refetch()} retryLabel={t("common.retry")} />;

  const firstName = me?.profile.name.split(" ")[0] ?? "";
  const insight = d.insights[0];
  const nextLesson = courses?.flatMap((c) => c.lessons.map((l) => ({ ...l, course: c }))).find((l) => !learning?.completed[l.slug]);
  const joined = learning?.challenges.find((c) => !c.completed);
  const challengeDef = CHALLENGES.find((c) => c.key === (joined?.key ?? "track7"))!;
  const change = d.healthChange;

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">
        {t(greetingKey(new Date().getHours()))}, {firstName} 👋
      </h1>
      <p className="mt-1 text-muted">{t("app.tagline")}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Financial health: the signature element */}
          <Link to="/health" className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-[var(--radius-panel)] bg-leaf-600 p-6 text-white sm:flex-row sm:items-center sm:gap-8">
            <PetalScore score={d.health.score} band={d.health.band} factors={d.health.factors} size={176} onDark />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-white/75">{t("home.healthScore")}</p>
              <p className="mt-1 text-3xl font-bold">{t(`health.bands.${d.health.band}`)}</p>
              {change !== null && change !== 0 && (
                <p className="mt-1 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">{t("home.scoreChange", { change: `${change > 0 ? "+" : ""}${change}` })}</p>
              )}
              <p className="mt-3 text-white/90">{t(`health.bandMessages.${d.health.band}`)}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#FDF1C9] group-hover:underline">
                {t("health.howCalculated")} <ChevronRight className="size-4" />
              </span>
            </div>
          </Link>

          {/* Income / spending / savings strip */}
          <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-card)] border border-line bg-card sm:grid-cols-4">
            {[
              { k: "home.income", v: d.income, c: "text-ink" },
              { k: "home.spent", v: d.spent, c: "text-ink" },
              { k: "home.saved", v: d.saved, c: "text-leaf-600" },
              { k: "home.remaining", v: d.remaining, c: d.remaining < 0 ? "text-alert-500" : "text-ink" },
            ].map((s, i) => (
              <div key={s.k} className={cx("px-4 py-4", i % 2 === 1 && "border-l border-line", i > 1 && "border-t border-line sm:border-t-0", i === 2 && "sm:border-l")}>
                <dt className="text-sm text-muted">{t(s.k)}</dt>
                <dd className={cx("figure mt-1 text-[22px] font-bold", s.c)}>{money(s.v)}</dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-2 gap-3">
            <Button className="h-auto min-h-11 px-3 py-2 text-center text-sm leading-tight sm:text-[15px]" onClick={() => openAdd("expense")}>
              <Plus className="size-5" /> {t("nav.addExpense")}
            </Button>
            <Button variant="secondary" className="h-auto min-h-11 px-3 py-2 text-center text-sm leading-tight sm:text-[15px]" onClick={() => openAdd("income")}>
              {t("money.addIncome")}
            </Button>
          </div>

          <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">{t("home.whereMoneyWent")}</h2>
            <SpendingDonut d={d} />
          </section>

          <section className="hidden rounded-[var(--radius-card)] border border-line bg-card p-5 lg:block">
            <RecentTransactions d={d} />
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {insight && (
            <div className="flex gap-3 rounded-[var(--radius-card)] bg-saffron-100 p-5">
              <Lightbulb className="mt-0.5 size-6 shrink-0 text-saffron-700" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-saffron-700">{t("home.dailyInsight")}</p>
                <p className="mt-1 font-medium leading-relaxed">{renderInsight(t, money, insight)}</p>
              </div>
            </div>
          )}

          <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold">{t("home.budget")}</h2>
              <Link to="/money?tab=budget" className="text-sm font-semibold text-leaf-800">
                {d.budget ? t("common.seeAll") : t("home.createBudget")}
              </Link>
            </div>
            {d.budget ? (
              <>
                <p className="figure mt-3 text-[22px] font-bold">{t("home.budgetOf", { spent: money(d.budget.spent), planned: money(d.budget.planned) })}</p>
                <div className="mt-3">
                  <ProgressBar value={(d.budget.spent / Math.max(d.budget.planned, 1)) * 100} tone={d.budget.spent > d.budget.planned ? "alert" : d.budget.spent > d.budget.planned * 0.8 ? "amber" : "leaf"} label={t("home.budget")} />
                </div>
                <ul className="mt-4 flex flex-col gap-2">
                  {d.budget.progress
                    .filter((p) => p.status !== "ok")
                    .slice(0, 3)
                    .map((p) => (
                      <li key={p.categoryKey} className="flex justify-between text-sm">
                        <span>{t(`categories.${p.categoryKey}`)}</span>
                        <span className={cx("font-semibold", p.status === "over" ? "text-alert-500" : "text-amber-600")}>{t(`budget.status.${p.status}`)}</span>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">{t("home.noBudget")}</p>
            )}
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold">{t("home.savingsGoals")}</h2>
              <Link to="/goals" className="text-sm font-semibold text-leaf-800">
                {t("common.seeAll")}
              </Link>
            </div>
            {d.goals.filter((g) => g.status !== "archived").length ? (
              <ul className="mt-3 flex flex-col gap-4">
                {d.goals
                  .filter((g) => g.status !== "archived")
                  .slice(0, 3)
                  .map((g) => (
                    <li key={g.id}>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-semibold">{g.name}</span>
                        <span className="figure text-muted">
                          {money(g.saved)} / {money(g.target)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <ProgressBar value={g.progressPercent} label={g.name} />
                        <span className="figure w-10 text-right text-sm font-semibold">{Math.round(g.progressPercent)}%</span>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">{t("goals.noGoals")}</p>
            )}
          </section>

          {nextLesson && (
            <Link to={`/learn/lesson/${nextLesson.slug}`} className="flex items-center gap-4 rounded-[var(--radius-card)] bg-lagoon-50 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-card text-2xl" aria-hidden>
                {nextLesson.course.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-lagoon-700">{t("home.continueLearning")}</span>
                <span className="block font-bold">{pick(nextLesson.title)}</span>
                <span className="text-sm text-muted">
                  <BookOpen className="mr-1 inline size-4" aria-hidden />
                  {t("common.minutes", { n: nextLesson.minutes })}
                </span>
              </span>
              <ChevronRight className="size-5 text-lagoon-700" />
            </Link>
          )}

          <Link to="/achievements" className="rounded-[var(--radius-card)] border border-line bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("home.weeklyChallenge")}</h2>
              {learning && learning.streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-saffron-100 px-2.5 py-1 text-sm font-semibold text-saffron-700">
                  <Flame className="size-4" /> {t("learn.streak", { n: learning.streak })}
                </span>
              )}
            </div>
            <p className="mt-2 font-semibold">
              {challengeDef.icon} {pick(challengeDef.title)}
            </p>
            {joined ? (
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={(joined.progress / challengeDef.target) * 100} tone="saffron" label={pick(challengeDef.title)} />
                <span className="figure whitespace-nowrap text-sm font-semibold">{t("challenges.progress", { current: joined.progress, target: challengeDef.target })}</span>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted">{pick(challengeDef.description)}</p>
            )}
          </Link>

          <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
            <h2 className="text-lg font-bold">{t("home.upcomingBills")}</h2>
            {d.upcomingBills.length ? (
              <ul className="mt-2 divide-y divide-line">
                {d.upcomingBills.slice(0, 4).map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <CalendarClock className={cx("size-5", b.daysUntil <= 3 ? "text-amber-600" : "text-muted")} aria-hidden />
                    <span className="flex-1">
                      <span className="block font-semibold">{b.name}</span>
                      <span className="text-sm text-muted">
                        {b.daysUntil === 0 ? t("home.dueToday") : t("home.dueIn", { n: b.daysUntil })} · {date(b.nextDue)}
                      </span>
                    </span>
                    <span className="figure font-semibold">{money(b.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">{t("home.noBills")}</p>
            )}
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-card p-5 lg:hidden">
            <RecentTransactions d={d} />
          </section>
        </div>
      </div>
    </div>
  );
}

function RecentTransactions({ d }: { d: DashboardDTO }) {
  const { t } = useI18n();
  const openAdd = useQuickAdd();
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">{t("home.recentTransactions")}</h2>
        <Link to="/money?tab=transactions" className="text-sm font-semibold text-leaf-800">
          {t("common.seeAll")}
        </Link>
      </div>
      {d.recent.length ? (
        <div className="mt-1 divide-y divide-line">
          {d.recent.slice(0, 6).map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      ) : (
        <div className="mt-3 text-center">
          <p className="font-semibold">{t("money.noTransactions")}</p>
          <p className="mt-1 text-sm text-muted">{t("money.noTransactionsBody")}</p>
          <Button className="mt-4" onClick={() => openAdd()}>
            {t("nav.addExpense")}
          </Button>
        </div>
      )}
    </>
  );
}

export { GROUP_COLORS, getCategory };
