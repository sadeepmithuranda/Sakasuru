import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { BADGES, CHALLENGES } from "@sakasuru/content";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useLearning } from "@/lib/queries";
import { Button, PageHeader, ProgressBar, Section, Skeleton } from "@/components/ui";
import { cx } from "@/lib/util";

export function AchievementsPage() {
  const { t, pick, date } = useI18n();
  const { data: l, isLoading } = useLearning();
  const qc = useQueryClient();
  const join = useMutation({ mutationFn: api.joinChallenge, onSuccess: (s) => qc.setQueryData(["learning"], s) });
  const done = useMutation({ mutationFn: api.completeChallenge, onSuccess: (s) => qc.setQueryData(["learning"], s) });
  if (isLoading || !l) return <Skeleton className="h-96" />;
  const earned = new Map(l.badges.map((b) => [b.key, b.earnedAt]));
  return (
    <div>
      <PageHeader title={t("learn.achievements")} />
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line">
        <div className="bg-card p-4">
          <p className="text-sm text-muted">{t("learn.levelLabel", { n: "" }).trim()}</p>
          <p className="figure text-3xl font-bold">{l.level}</p>
          <div className="mt-2">
            <ProgressBar value={(l.currentLevelXp / l.nextLevelXp) * 100} tone="saffron" label={t("learn.nextLevel", { n: l.nextLevelXp - l.currentLevelXp })} />
          </div>
          <p className="mt-1 text-xs text-muted">{t("learn.nextLevel", { n: l.nextLevelXp - l.currentLevelXp })}</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-sm text-muted">XP</p>
          <p className="figure text-3xl font-bold">{l.xp}</p>
        </div>
        <div className="bg-card p-4">
          <p className="flex items-center gap-1 text-sm text-muted">
            <Flame className="size-4 text-saffron-400" /> {t("learn.streakDays")}
          </p>
          <p className="figure text-3xl font-bold">{l.streak}</p>
        </div>
      </div>

      <Section title={t("challenges.title")}>
        <ul className="grid gap-3 md:grid-cols-2">
          {CHALLENGES.map((c) => {
            const p = l.challenges.find((x) => x.key === c.key);
            const daysLeft = p ? Math.max(0, c.durationDays - Math.floor((Date.now() - new Date(p.joinedAt).getTime()) / 86_400_000)) : c.durationDays;
            return (
              <li key={c.key} className={cx("rounded-[var(--radius-card)] border bg-card p-4", p?.completed ? "border-saffron-400" : "border-line")}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden>
                    {c.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold">{pick(c.title)}</p>
                    <p className="text-sm text-muted">{pick(c.description)}</p>
                  </div>
                </div>
                {p ? (
                  p.completed ? (
                    <p className="mt-3 font-semibold text-saffron-700">✓ {t("challenges.completed")}</p>
                  ) : (
                    <>
                      <div className="mt-3 flex items-center gap-3">
                        <ProgressBar value={(p.progress / c.target) * 100} tone="saffron" label={pick(c.title)} />
                        <span className="figure text-sm font-semibold">{t("challenges.progress", { current: p.progress, target: c.target })}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{t("challenges.endsIn", { n: daysLeft })}</p>
                      {c.metric === "subscriptionReview" && (
                        <Button size="sm" variant="secondary" className="mt-3" onClick={() => done.mutate(c.key)}>
                          {t("common.done")}
                        </Button>
                      )}
                    </>
                  )
                ) : (
                  <Button size="sm" className="mt-3" onClick={() => join.mutate(c.key)} loading={join.isPending && join.variables === c.key}>
                    {t("challenges.join")}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title={t("badges.title")}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => {
            const at = earned.get(b.key);
            return (
              <li key={b.key} className={cx("flex flex-col items-center rounded-[var(--radius-card)] p-4 text-center", at ? "bg-saffron-100" : "border border-dashed border-line bg-card")}>
                <span className={cx("text-4xl", !at && "opacity-30 grayscale")} aria-hidden>
                  {b.icon}
                </span>
                <p className="mt-2 font-bold leading-tight">{pick(b.title)}</p>
                <p className="mt-1 text-xs text-muted">{pick(b.description)}</p>
                <p className={cx("mt-2 text-xs font-semibold", at ? "text-saffron-700" : "text-muted")}>{at ? t("badges.earned", { date: date(at) }) : t("badges.locked")}</p>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
