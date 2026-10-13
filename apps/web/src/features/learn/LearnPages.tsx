import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Flame, Check, Lock, Clock, ChevronRight, WifiOff } from "lucide-react";
import { COURSES, searchLessons } from "@sakasuru/content";
import type { CourseSummaryDTO, LearningStateDTO } from "@sakasuru/validation";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/api-context";
import { useCourses, useDashboard, useLearning } from "@/lib/queries";
import { ErrorState, PageHeader, ProgressBar, Section, Skeleton } from "@/components/ui";
import { cx } from "@/lib/util";

type LessonItem = CourseSummaryDTO["lessons"][number] & { course: CourseSummaryDTO };

/** Prerequisite rule: investing content unlocks after the emergency-fund lesson. */
export function lockedBy(course: CourseSummaryDTO, learning: LearningStateDTO | undefined): string | null {
  const missing = course.prerequisites.find((p) => !learning?.completed[p]);
  return missing ?? null;
}

function useAllLessons(courses: CourseSummaryDTO[] | undefined): LessonItem[] {
  return useMemo(() => (courses ?? []).flatMap((c) => c.lessons.map((l) => ({ ...l, course: c }))), [courses]);
}

/** Personalised recommendations from profile goals and behaviour. */
function useRecommendations(all: LessonItem[], learning: LearningStateDTO | undefined) {
  const { me } = useSession();
  const { data: d } = useDashboard();
  return useMemo(() => {
    const want = new Set<string>();
    const help = me?.profile.helpWith ?? [];
    if (d?.budget?.progress.some((p) => p.status === "over") || help.includes("controlSpending")) want.add("budgeting-basics");
    if (d && d.debtTotals.total > 0) (want.add("credit-card-minimum"), want.add("loans-and-interest"));
    if (help.includes("payDebt")) want.add("loans-and-interest");
    if (help.includes("emergencyFund") || (d && d.emergencyFund < d.essentialMonthly * 3)) want.add("emergency-fund");
    if (help.includes("startInvesting")) ["emergency-fund", "risk-and-return", "ponzi-schemes"].forEach((s) => want.add(s));
    if (help.includes("digitalPayments")) (want.add("lankaqr-payments"), want.add("otp-pin-safety"));
    if (help.includes("smallBusiness")) want.add("revenue-profit-cashflow");
    want.add("phishing-fake-links");
    return all.filter((l) => want.has(l.slug) && !learning?.completed[l.slug]).slice(0, 4);
  }, [all, learning, me, d]);
}

function LessonRow({ l, learning }: { l: LessonItem; learning?: LearningStateDTO }) {
  const { t, pick } = useI18n();
  const done = learning?.completed[l.slug];
  const lock = lockedBy(l.course, learning);
  const lockTitle = lock ? COURSES.flatMap((c) => c.lessons).find((x) => x.slug === lock)?.title : null;
  return (
    <li>
      <Link to={lock ? "#" : `/learn/lesson/${l.slug}`} aria-disabled={!!lock} onClick={(e) => lock && e.preventDefault()} className={cx("flex items-center gap-3 py-3.5", lock && "cursor-not-allowed opacity-60")}>
        <span className={cx("grid size-10 shrink-0 place-items-center rounded-full", done ? "bg-leaf-600 text-white" : lock ? "bg-surface text-muted" : "bg-leaf-50 text-leaf-800")}>
          {done ? <Check className="size-5" /> : lock ? <Lock className="size-4" /> : <span className="text-lg" aria-hidden>{l.course.icon}</span>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{pick(l.title)}</span>
          <span className="block truncate text-sm text-muted">{lock && lockTitle ? t("learn.locked", { lesson: pick(lockTitle) }) : pick(l.summary)}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-sm text-muted">
          <Clock className="size-4" aria-hidden /> {t("common.minutes", { n: l.minutes })}
        </span>
      </Link>
    </li>
  );
}

export function LearnPage() {
  const { t, pick } = useI18n();
  const { data: courses, isLoading, isError, refetch } = useCourses();
  const { data: learning } = useLearning();
  const [q, setQ] = useState("");
  const all = useAllLessons(courses);
  const recs = useRecommendations(all, learning);
  const next = all.find((l) => !learning?.completed[l.slug] && !lockedBy(l.course, learning));
  const results = q.trim() ? searchLessons(COURSES, q).map((h) => all.find((l) => l.slug === h.lesson.slug)).filter(Boolean) as LessonItem[] : [];
  const doneCount = Object.keys(learning?.completed ?? {}).length;

  return (
    <div>
      <PageHeader title={t("learn.title")} />
      {/* Progress band */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        {next ? (
          <Link to={`/learn/lesson/${next.slug}`} className="flex items-center gap-4 rounded-[var(--radius-panel)] bg-lagoon-deep p-5 text-white">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl" aria-hidden>
              {next.course.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-white/75">{t("learn.dailyLesson")}</span>
              <span className="block text-lg font-bold">{pick(next.title)}</span>
              <span className="text-sm text-white/80">{t("common.minutes", { n: next.minutes })} · {t("common.xp", { n: next.xp })}</span>
            </span>
            <span className="hidden shrink-0 rounded-full bg-card px-4 py-2 text-sm font-bold text-lagoon-700 sm:inline-flex">{t("learn.start")}</span>
          </Link>
        ) : (
          <div className="rounded-[var(--radius-panel)] bg-leaf-50 p-5 font-semibold text-leaf-800">{t("learn.completed")} 🎉</div>
        )}
        <Link to="/achievements" className="flex items-center gap-5 rounded-[var(--radius-panel)] border border-line bg-card px-5 py-4">
          <div className="text-center">
            <Flame className={cx("mx-auto size-7", learning?.streak ? "text-saffron-400" : "text-line")} aria-hidden />
            <p className="figure text-xl font-bold">{learning?.streak ?? 0}</p>
            <p className="text-xs text-muted">{learning?.streak ? t("learn.streakDays") : t("learn.noStreak")}</p>
          </div>
          <div className="min-w-32">
            <p className="text-sm font-semibold">{t("learn.levelLabel", { n: learning?.level ?? 1 })}</p>
            <div className="mt-1.5">
              <ProgressBar value={learning ? (learning.currentLevelXp / learning.nextLevelXp) * 100 : 0} tone="saffron" label={t("learn.levelLabel", { n: learning?.level ?? 1 })} />
            </div>
            <p className="mt-1 text-xs text-muted">{t("learn.totalXp", { n: learning?.xp ?? 0 })}</p>
          </div>
        </Link>
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("learn.searchPlaceholder")}
          aria-label={t("common.search")}
          className="h-12 w-full rounded-full border border-line bg-card pl-12 pr-4 focus:border-leaf-500 focus:outline-none focus:ring-3 focus:ring-leaf-100"
        />
      </div>

      {q.trim() ? (
        <Section title={t("common.search")}>
          {results.length ? (
            <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-4">
              {results.map((l) => (
                <LessonRow key={l.slug} l={l} learning={learning} />
              ))}
            </ul>
          ) : (
            <p className="text-muted">{t("learn.noResults")}</p>
          )}
        </Section>
      ) : (
        <>
          {recs.length > 0 && (
            <Section title={t("learn.recommended")}>
              <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-4">
                {recs.map((l) => (
                  <LessonRow key={l.slug} l={l} learning={learning} />
                ))}
              </ul>
            </Section>
          )}
          <Section title={t("learn.courses")} action={<span className="flex items-center gap-1 text-xs text-muted"><WifiOff className="size-3.5" /> {t("learn.downloadOffline")}</span>}>
            {isLoading ? (
              <Skeleton className="h-64" />
            ) : isError ? (
              <ErrorState message={t("common.error")} onRetry={() => refetch()} retryLabel={t("common.retry")} />
            ) : (
              <ol className="grid gap-3 md:grid-cols-2">
                {courses!.map((c) => {
                  const done = c.lessons.filter((l) => learning?.completed[l.slug]).length;
                  return (
                    <li key={c.slug}>
                      <Link to={`/learn/${c.slug}`} className="flex h-full gap-4 rounded-[var(--radius-card)] border border-line bg-card p-4 hover:border-leaf-300">
                        <span className="grid size-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: c.color + "1A" }} aria-hidden>
                          {c.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-xs font-semibold" style={{ color: c.color }}>
                            {t("learn.level", { n: c.level })}
                          </span>
                          <span className="block font-bold">{pick(c.title)}</span>
                          <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{pick(c.description)}</span>
                          <span className="mt-2 flex items-center gap-2">
                            <ProgressBar value={c.lessons.length ? (done / c.lessons.length) * 100 : 0} label={pick(c.title)} />
                            <span className="shrink-0 text-xs text-muted">{t("learn.progress", { done, total: c.lessons.length })}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
          <p className="mt-6 text-sm text-muted">{doneCount > 0 && t("learn.progress", { done: doneCount, total: all.length })}</p>
        </>
      )}
    </div>
  );
}

export function CoursePage() {
  const { slug } = useParams();
  const { t, pick } = useI18n();
  const { data: courses, isLoading } = useCourses();
  const { data: learning } = useLearning();
  const course = courses?.find((c) => c.slug === slug);
  if (isLoading) return <Skeleton className="h-64" />;
  if (!course) return <p>{t("common.notFound")}</p>;
  const done = course.lessons.filter((l) => learning?.completed[l.slug]).length;
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/learn" className="text-sm font-semibold text-leaf-800">
        ← {t("learn.title")}
      </Link>
      <div className="mt-4 rounded-[var(--radius-panel)] p-6" style={{ background: course.color + "14" }}>
        <span className="text-5xl" aria-hidden>
          {course.icon}
        </span>
        <p className="mt-3 text-sm font-semibold" style={{ color: course.color }}>
          {t("learn.level", { n: course.level })}
        </p>
        <h1 className="text-[28px] font-bold leading-tight">{pick(course.title)}</h1>
        <p className="mt-2 text-ink-soft">{pick(course.description)}</p>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={(done / Math.max(course.lessons.length, 1)) * 100} label={pick(course.title)} />
          <span className="shrink-0 text-sm font-semibold">{t("learn.progress", { done, total: course.lessons.length })}</span>
        </div>
      </div>
      <ol className="mt-6 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-4">
        {course.lessons.map((l) => (
          <LessonRow key={l.slug} l={{ ...l, course }} learning={learning} />
        ))}
      </ol>
      <Link to="/learn" className="mt-6 flex items-center justify-between rounded-2xl bg-surface p-4 text-sm font-semibold">
        {t("learn.courses")} <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
