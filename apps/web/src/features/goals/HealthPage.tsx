import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useI18n } from "@/lib/i18n";
import { useDashboard, useHealthHistory } from "@/lib/queries";
import { PetalScore } from "@/components/brand";
import { ErrorState, PageHeader, ProgressBar, Section, Skeleton } from "@/components/ui";
import { cx } from "@/lib/util";

const FACTOR_LINK: Record<string, string> = { saving: "/money?tab=budget", emergency: "/goals/emergency", debt: "/money?tab=debts", budgeting: "/money?tab=budget", spending: "/money", goals: "/goals", knowledge: "/learn", protection: "/scam-shield" };

/** The scoring is fully transparent: every factor, its rule and its points are shown. */
export function HealthPage() {
  const { t, month } = useI18n();
  const { data: d, isLoading, isError, refetch } = useDashboard();
  const { data: history } = useHealthHistory();
  if (isLoading) return <Skeleton className="h-96" />;
  if (isError || !d) return <ErrorState message={t("common.error")} onRetry={() => refetch()} retryLabel={t("common.retry")} />;
  const h = d.health;
  const tips = h.factors.filter((f) => f.tipKey).sort((a, b) => b.max - b.score - (a.max - a.score));
  return (
    <div>
      <PageHeader title={t("health.title")} />
      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col items-center rounded-[var(--radius-panel)] bg-card p-6 text-center shadow-[var(--shadow-lift)]">
          <PetalScore score={h.score} band={h.band} factors={h.factors} size={240} />
          <p className="mt-3 text-2xl font-bold text-brand-800">{t(`health.bands.${h.band}`)}</p>
          <p className="mt-2 text-ink-soft">{t(`health.bandMessages.${h.band}`)}</p>
          <div className="mt-4 flex w-full gap-1 text-xs" aria-hidden>
            {[
              ["needsAttention", "0–39"],
              ["building", "40–59"],
              ["good", "60–79"],
              ["strong", "80–100"],
            ].map(([b, r]) => (
              <div key={b} className={cx("flex-1 rounded-lg px-1 py-1.5", b === h.band ? "bg-brand-600 font-semibold text-white" : "bg-surface text-muted")}>
                {r}
              </div>
            ))}
          </div>
          <p className="mt-5 flex gap-2 rounded-2xl bg-learn-50 p-3 text-left text-sm text-learn-700">
            <Info className="mt-0.5 size-4 shrink-0" /> {t("health.notCredit")}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">{t("health.howCalculated")}</h2>
          <ul className="mt-3 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">
            {h.factors.map((f) => (
              <li key={f.key} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <Link to={FACTOR_LINK[f.key] ?? "/"} className="font-semibold hover:underline">
                    {t(`health.factors.${f.key}`)}
                  </Link>
                  <span className="figure font-bold">
                    {t("health.points", { score: f.score, max: f.max })}
                    {f.missingData && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">{t("health.missing")}</span>}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={(f.score / f.max) * 100} label={t(`health.factors.${f.key}`)} />
                </div>
                <p className="mt-2 text-sm text-muted">{t(`health.factorRules.${f.key}`)}</p>
              </li>
            ))}
          </ul>

          {tips.length > 0 && (
            <Section title={t("health.whatImproves")}>
              <ul className="flex flex-col gap-2">
                {tips.slice(0, 4).map((f) => (
                  <li key={f.key}>
                    <Link to={FACTOR_LINK[f.key] ?? "/"} className="flex items-center justify-between gap-3 rounded-2xl bg-brand-50 p-4 font-medium text-brand-800">
                      {t(f.tipKey!)}
                      <span className="figure shrink-0 text-sm">+{f.max - f.score}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {history && history.length > 1 && (
            <Section title={t("health.history")}>
              <div className="h-56 rounded-[var(--radius-card)] border border-line bg-card p-3">
                <ResponsiveContainer>
                  <LineChart data={history.map((p) => ({ ...p, label: month(p.month).split(" ")[0] }))}>
                    <CartesianGrid stroke="var(--color-track)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} width={28} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="var(--color-brand-600)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-brand-600)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
