import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ShieldCheck, ShieldQuestion, Phone } from "lucide-react";
import { SCAM_EXAMPLES } from "@sakasuru/content";
import type { ScamCheckResult } from "@sakasuru/financial-engine";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useCourses, useLearning } from "@/lib/queries";
import { Button, PageHeader, Section } from "@/components/ui";
import { cx } from "@/lib/util";

const RISK = {
  low: { icon: ShieldCheck, cls: "bg-brand-50 text-brand-800 border-brand-300" },
  suspicious: { icon: ShieldQuestion, cls: "bg-amber-50 text-amber-600 border-amber-600/40" },
  high: { icon: ShieldAlert, cls: "bg-alert-50 text-alert-500 border-alert-500/40" },
};

export function ScamShieldPage() {
  const { t, pick } = useI18n();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScamCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [qi, setQi] = useState(0);
  const [guess, setGuess] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const { data: courses } = useCourses();
  const { data: learning } = useLearning();
  const protection = courses?.flatMap((c) => c.lessons.filter((l) => l.protection)) ?? [];

  const check = async () => {
    setLoading(true);
    try {
      setResult(await api.checkScam(text));
    } finally {
      setLoading(false);
    }
  };
  const ex = SCAM_EXAMPLES[qi % SCAM_EXAMPLES.length]!;
  const R = result ? RISK[result.risk] : null;

  return (
    <div>
      <PageHeader title={t("scam.title")} subtitle={t("scam.subtitle")} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[var(--radius-panel)] border border-line bg-card p-5 sm:p-6">
          <h2 className="text-xl font-bold">{t("scam.checker")}</h2>
          <p className="mt-1 text-muted">{t("scam.checkerSubtitle")}</p>
          <label className="sr-only" htmlFor="scam-text">
            {t("scam.placeholder")}
          </label>
          <textarea id="scam-text" value={text} onChange={(e) => (setText(e.target.value), setResult(null))} maxLength={5000} rows={6} placeholder={t("scam.placeholder")} className="mt-4 w-full rounded-2xl border border-line bg-surface p-4 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-100" />
          <Button className="mt-3 w-full" onClick={check} loading={loading} disabled={!text.trim()}>
            {t("scam.check")}
          </Button>
          {result && R && (
            <div className={cx("mt-5 rounded-2xl border-2 p-5", R.cls)} role="status">
              <div className="flex items-center gap-3">
                <R.icon className="size-8" aria-hidden />
                <p className="text-2xl font-bold">{t(`scam.risk.${result.risk}`)}</p>
              </div>
              <p className="mt-2 text-ink">{t(result.risk === "low" ? "scam.riskLowBody" : result.risk === "suspicious" ? "scam.riskSuspiciousBody" : "scam.riskHighBody")}</p>
              {result.signals.length > 0 && (
                <>
                  <p className="mt-4 font-semibold text-ink">{t("scam.signalsFound")}</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {result.signals.map((s) => (
                      <li key={s.key} className="rounded-xl bg-card/80 p-3 text-ink">
                        <span className="font-semibold">🚩 {t(`scam.signals.${s.key}`)}</span>
                        <span className="mt-0.5 block text-sm text-muted">“{s.match}”</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-4 text-sm font-medium text-ink">{t("scam.verify")}</p>
            </div>
          )}
          <p className="mt-4 rounded-2xl bg-surface p-3 text-sm font-semibold">{t("scam.never")}</p>
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-[var(--radius-panel)] bg-learn-deep p-5 text-white sm:p-6">
            <h2 className="text-xl font-bold">{t("scam.quizTitle")}</h2>
            <blockquote className="mt-4 rounded-2xl bg-white/10 p-4 text-lg leading-relaxed">{pick(ex.message)}</blockquote>
            {guess === null ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => (setGuess(true), ex.isScam && setScore((s) => s + 1))} className="rounded-full bg-card py-3 font-bold text-alert-500">
                  🚩 {t("scam.isScam")}
                </button>
                <button onClick={() => (setGuess(false), !ex.isScam && setScore((s) => s + 1))} className="rounded-full bg-card py-3 font-bold text-brand-800">
                  ✓ {t("scam.isSafe")}
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-lg font-bold">{guess === ex.isScam ? t("learn.correct") : t("learn.incorrect")} — {ex.isScam ? t("scam.isScam") : t("scam.isSafe")}</p>
                <p className="mt-1 text-white/85">{pick(ex.explanation)}</p>
                <Button variant="quiet" className="mt-4" onClick={() => (setQi(qi + 1), setGuess(null))}>
                  {t("common.next")}
                </Button>
              </div>
            )}
            <p className="mt-4 text-sm text-white/70">
              {score} / {qi + (guess === null ? 0 : 1)}
            </p>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
            <h2 className="text-lg font-bold">{t("scam.redFlags")}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {["guaranteed", "otp", "urgent", "unlock", "zeroRisk"].map((k) => (
                <li key={k} className="rounded-xl bg-alert-50 px-3 py-2 font-medium text-alert-500">
                  {t(`scam.flags.${k}`)}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <Section title={t("scam.learnMore")}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {protection.map((l) => (
            <li key={l.slug}>
              <Link to={`/learn/lesson/${l.slug}`} className="flex h-full items-center gap-3 rounded-[var(--radius-card)] border border-line bg-card p-4 hover:border-brand-300">
                <ShieldCheck className={cx("size-7 shrink-0", learning?.completed[l.slug] ? "text-brand-600" : "text-muted")} />
                <span className="font-semibold">{pick(l.title)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <section className="mt-8 flex gap-4 rounded-[var(--radius-card)] bg-alert-50 p-5">
        <Phone className="size-6 shrink-0 text-alert-500" />
        <div>
          <h2 className="font-bold text-alert-500">{t("scam.reportTitle")}</h2>
          <p className="mt-1">{t("scam.reportBody")}</p>
        </div>
      </section>
    </div>
  );
}
