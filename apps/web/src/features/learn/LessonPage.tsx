import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, CheckCircle2, XCircle, AlertTriangle, BookOpen, Lightbulb, Sparkles, ExternalLink } from "lucide-react";
import type { LessonCard } from "@sakasuru/content";
import type { LessonCompleteResultDTO } from "@sakasuru/validation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useCourses, useLesson } from "@/lib/queries";
import { badgeByKey } from "@/lib/format";
import { Button, ErrorState, ProgressBar, Skeleton } from "@/components/ui";
import { cx } from "@/lib/util";

const CARD_STYLE: Record<LessonCard["type"], { bg: string; icon: typeof BookOpen; tone: string }> = {
  story: { bg: "bg-card", icon: BookOpen, tone: "text-learn-700" },
  concept: { bg: "bg-brand-50", icon: Lightbulb, tone: "text-brand-800" },
  example: { bg: "bg-card", icon: Sparkles, tone: "text-accent-700" },
  question: { bg: "bg-learn-50", icon: Sparkles, tone: "text-learn-700" },
  tip: { bg: "bg-accent-100", icon: Lightbulb, tone: "text-accent-700" },
  warning: { bg: "bg-alert-50", icon: AlertTriangle, tone: "text-alert-500" },
};

function OptionButton({ label, state, onClick, disabled }: { label: string; state: "idle" | "selected" | "correct" | "wrong"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={cx(
        "flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-medium transition-colors",
        state === "idle" && "border-line bg-card hover:border-brand-300",
        state === "selected" && "border-learn-500 bg-learn-50",
        state === "correct" && "border-brand-500 bg-brand-50",
        state === "wrong" && "border-alert-500 bg-alert-50",
      )}
    >
      <span className="flex-1">{label}</span>
      {state === "correct" && <CheckCircle2 className="size-5 text-brand-600" aria-label="correct" />}
      {state === "wrong" && <XCircle className="size-5 text-alert-500" aria-label="incorrect" />}
    </button>
  );
}

/** Micro-lesson player: story-first cards → quiz with explanations → result. */
export function LessonPage() {
  const { slug = "" } = useParams();
  const { t, pick, date } = useI18n();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: lesson, isLoading, isError, refetch } = useLesson(slug);
  const { data: courses } = useCourses();
  const [phase, setPhase] = useState<"cards" | "quiz" | "result">("cards");
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | string | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LessonCompleteResultDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <Skeleton className="mx-auto h-[70vh] max-w-xl" />;
  if (isError || !lesson) return <ErrorState message={t("common.notFound")} onRetry={() => refetch()} retryLabel={t("common.retry")} />;

  const total = lesson.cards.length + lesson.quiz.length;
  const position = phase === "cards" ? i : phase === "quiz" ? lesson.cards.length + i : total;
  const reset = () => (setPicked(null), setChecked(false));

  const submit = async (final: Record<string, string>) => {
    setSubmitting(true);
    try {
      const r = await api.completeLesson(lesson.slug, final);
      setResult(r);
      setPhase("result");
      for (const k of ["learning", "dashboard", "notifications"]) qc.invalidateQueries({ queryKey: [k] });
    } finally {
      setSubmitting(false);
    }
  };

  const allLessons = courses?.flatMap((c) => c.lessons) ?? [];
  const nextLesson = allLessons[allLessons.findIndex((l) => l.slug === lesson.slug) + 1];

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => nav(`/learn/${lesson.courseSlug}`)} className="grid size-10 place-items-center rounded-full hover:bg-brand-50" aria-label={t("common.close")}>
          <X className="size-5" />
        </button>
        <ProgressBar value={(position / total) * 100} label={pick(lesson.title)} />
      </div>
      <h1 className="mt-4 text-sm font-semibold text-muted">{pick(lesson.title)}</h1>

      <AnimatePresence mode="wait">
        {phase === "cards" && (() => {
          const card = lesson.cards[i]!;
          const S = CARD_STYLE[card.type];
          const isQ = card.type === "question" && card.options;
          const last = i === lesson.cards.length - 1;
          return (
            <motion.section key={`c${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }} className="mt-4">
              <div className={cx("min-h-[300px] rounded-[var(--radius-panel)] border border-line p-6", S.bg)}>
                <S.icon className={cx("size-7", S.tone)} aria-hidden />
                {card.title && <h2 className="mt-3 text-2xl font-bold leading-snug">{pick(card.title)}</h2>}
                <p className={cx("mt-3 text-lg leading-relaxed", isQ && "font-semibold")}>{pick(card.body)}</p>
                {isQ && (
                  <div className="mt-5 flex flex-col gap-2">
                    {card.options!.map((o, k) => (
                      <OptionButton key={k} label={pick(o.text)} disabled={checked} onClick={() => setPicked(k)} state={checked ? (o.correct ? "correct" : picked === k ? "wrong" : "idle") : picked === k ? "selected" : "idle"} />
                    ))}
                  </div>
                )}
                {isQ && checked && card.explanation && <p className="mt-4 rounded-2xl bg-card p-4 text-ink-soft">{pick(card.explanation)}</p>}
              </div>
              {last && (
                <div className="mt-4 text-xs text-muted">
                  {lesson.timeSensitive && <p className="mb-2 flex gap-1.5 text-amber-600"><AlertTriangle className="size-4 shrink-0" /> {t("learn.timeSensitive")}</p>}
                  <p>
                    {t("common.sources")}:{" "}
                    {lesson.sources.map((s, k) => (
                      <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-brand-800 underline-offset-2 hover:underline">
                        {s.name}
                        <ExternalLink className="size-3" />
                        {k < lesson.sources.length - 1 ? ", " : ""}
                      </a>
                    ))}{" "}
                    · {t("common.lastReviewed", { date: date(lesson.lastReviewed) })}
                  </p>
                </div>
              )}
              <div className="mt-5 flex gap-3">
                {i > 0 && (
                  <Button variant="quiet" onClick={() => (setI(i - 1), reset())}>
                    {t("common.back")}
                  </Button>
                )}
                {isQ && !checked ? (
                  <Button className="flex-1" disabled={picked === null} onClick={() => setChecked(true)}>
                    {t("learn.checkAnswer")}
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={() => (last ? (setPhase("quiz"), setI(0)) : setI(i + 1), reset())}>
                    {last ? t("learn.takeQuiz") : t("common.continue")}
                  </Button>
                )}
              </div>
            </motion.section>
          );
        })()}

        {phase === "quiz" && (() => {
          const q = lesson.quiz[i]!;
          const last = i === lesson.quiz.length - 1;
          const correct = checked && picked === q.correctId;
          return (
            <motion.section key={`q${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }} className="mt-4">
              <p className="text-sm font-semibold text-learn-700">{t("learn.question", { n: i + 1, total: lesson.quiz.length })}</p>
              <h2 className="mt-2 text-2xl font-bold leading-snug">{pick(q.prompt)}</h2>
              <div className="mt-5 flex flex-col gap-2">
                {q.options.map((o) => (
                  <OptionButton key={o.id} label={pick(o.text)} disabled={checked} onClick={() => setPicked(o.id)} state={checked ? (o.id === q.correctId ? "correct" : picked === o.id ? "wrong" : "idle") : picked === o.id ? "selected" : "idle"} />
                ))}
              </div>
              {checked && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx("mt-4 rounded-2xl p-4", correct ? "bg-brand-50" : "bg-amber-50")} role="status">
                  <p className={cx("font-bold", correct ? "text-brand-800" : "text-amber-600")}>{correct ? t("learn.correct") : t("learn.incorrect")}</p>
                  <p className="mt-1 text-ink-soft">{pick(q.explanation)}</p>
                </motion.div>
              )}
              <div className="mt-5">
                {!checked ? (
                  <Button className="w-full" disabled={picked === null} onClick={() => (setChecked(true), setAnswers({ ...answers, [q.id]: String(picked) }))}>
                    {t("learn.checkAnswer")}
                  </Button>
                ) : (
                  <Button className="w-full" loading={submitting} onClick={() => (last ? submit({ ...answers, [q.id]: String(picked) }) : (setI(i + 1), reset()))}>
                    {last ? t("common.done") : t("common.next")}
                  </Button>
                )}
              </div>
            </motion.section>
          );
        })()}

        {phase === "result" && result && (
          <motion.section key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 text-center">
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-accent-100 text-5xl">🎉</div>
            <h2 className="mt-4 text-[28px] font-bold">{t("learn.resultTitle")}</h2>
            <p className="mt-1 text-lg text-ink-soft">{t("learn.resultScore", { correct: result.correct, total: result.total })}</p>
            {result.xpEarned > 0 && <p className="figure mt-3 inline-flex rounded-full bg-accent-400 px-4 py-1.5 text-lg font-bold text-on-accent">{t("learn.xpEarned", { n: result.xpEarned })}</p>}
            {result.newBadges.length > 0 && (
              <div className="mt-6 rounded-[var(--radius-card)] border border-accent-400 bg-accent-100 p-5">
                <p className="font-bold text-accent-700">{t("learn.newBadge")}</p>
                <div className="mt-3 flex justify-center gap-6">
                  {result.newBadges.map((b) => (
                    <div key={b}>
                      <span className="text-4xl">{badgeByKey(b)?.icon}</span>
                      <p className="mt-1 text-sm font-semibold">{badgeByKey(b) ? pick(badgeByKey(b)!.title) : b}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3">
              {nextLesson && (
                <Button size="lg" onClick={() => (nav(`/learn/lesson/${nextLesson.slug}`), setPhase("cards"), setI(0), reset(), setAnswers({}), setResult(null))}>
                  {t("learn.nextLesson")}: {pick(nextLesson.title)}
                </Button>
              )}
              <Button variant="quiet" onClick={() => (setPhase("quiz"), setI(0), reset(), setAnswers({}))}>
                {t("learn.retake")}
              </Button>
              <Link to={`/learn/${lesson.courseSlug}`} className="font-semibold text-brand-800">
                {t("learn.backToCourse")}
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
