import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { AGE_RANGES, EMPLOYMENT, HELP_OPTIONS, INCOME_RANGES, GOAL_TYPES, type ProfileUpdate } from "@sakasuru/validation";
import type { DashboardDTO } from "@sakasuru/validation";
import { api, useSession } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { AuthLayout } from "@/components/layout/AppShell";
import { Button, Chip, MoneyInput, ProgressBar, Segmented } from "@/components/ui";
import { PetalScore } from "@/components/brand";

const STEPS = ["help", "age", "employment", "income", "expenses", "savings", "debt", "goal"] as const;
const RANGE_MID: Record<string, number> = { under30k: 25000, r30to60: 45000, r60to100: 80000, r100to200: 150000, over200k: 250000 };

/** Progressive onboarding: one easy question per screen, money questions optional. */
export function OnboardingPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { me, setMe } = useSession();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<ProfileUpdate & { helpWith: string[] }>({ helpWith: [] });
  const [incomeMode, setIncomeMode] = useState<"range" | "exact">("range");
  const [amounts, setAmounts] = useState({ income: "", expenses: "", savings: "", debt: "" });
  const [phase, setPhase] = useState<"questions" | "computing" | "result">("questions");
  const [dash, setDash] = useState<DashboardDTO | null>(null);

  const key = STEPS[step]!;
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish());
  const toNum = (s: string) => (s ? Number(s) : null);

  const finish = async () => {
    setPhase("computing");
    const income = incomeMode === "exact" ? toNum(amounts.income) : p.incomeRange ? RANGE_MID[p.incomeRange]! : null;
    const profile = await api.updateProfile({
      ...p,
      helpWith: p.helpWith as never,
      monthlyIncome: income,
      monthlyExpenses: toNum(amounts.expenses),
      currentSavings: toNum(amounts.savings),
      monthlyDebt: toNum(amounts.debt),
      onboardingCompleted: true,
    });
    if (me) setMe({ ...me, profile });
    const d = await api.dashboard();
    setDash(d);
    setTimeout(() => setPhase("result"), 900);
  };

  if (phase !== "questions")
    return (
      <AuthLayout>
        {phase === "computing" || !dash ? (
          <div className="grid flex-1 place-items-center text-center">
            <div>
              <div className="mx-auto size-16 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" aria-hidden />
              <p className="mt-6 text-lg font-semibold">{t("onboarding.computing")}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center text-center">
            <h1 className="mt-6 text-[28px] font-bold">{t("onboarding.resultTitle")}</h1>
            <div className="mt-6">
              <PetalScore score={dash.health.score} band={dash.health.band} factors={dash.health.factors} size={220} />
            </div>
            <p className="mt-4 text-xl font-bold text-brand-800">{t(`health.bands.${dash.health.band}`)}</p>
            <p className="mt-2 text-ink-soft">{t(`health.bandMessages.${dash.health.band}`)}</p>
            <p className="mt-6 rounded-2xl bg-learn-50 p-4 text-left text-sm text-learn-700">{t("onboarding.resultBody")}</p>
            <Button size="lg" className="mt-auto w-full" onClick={() => nav("/")}>
              {t("onboarding.resultCta")}
            </Button>
          </div>
        )}
      </AuthLayout>
    );

  const optional = ["income", "expenses", "savings", "debt"].includes(key);
  const canContinue = key === "help" ? p.helpWith.length > 0 : true;

  return (
    <AuthLayout>
      <div className="mt-2 flex items-center gap-3">
        <button onClick={() => (step ? setStep(step - 1) : nav(-1))} className="grid size-10 place-items-center rounded-full hover:bg-brand-50" aria-label={t("common.back")}>
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <ProgressBar value={((step + 1) / STEPS.length) * 100} label={t("onboarding.step", { n: step + 1, total: STEPS.length })} />
        </div>
        <span className="text-sm font-semibold text-muted">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="mt-8 flex flex-col gap-4">
          {key === "help" && (
            <>
              <h1 className="text-2xl font-bold">{t("onboarding.helpTitle")}</h1>
              <p className="text-muted">{t("onboarding.helpSubtitle")}</p>
              <div className="flex flex-col gap-2">
                {HELP_OPTIONS.map((h) => (
                  <Chip key={h} selected={p.helpWith.includes(h)} onClick={() => setP({ ...p, helpWith: p.helpWith.includes(h) ? p.helpWith.filter((x) => x !== h) : [...p.helpWith, h] })}>
                    {t(`onboarding.help.${h}`)}
                  </Chip>
                ))}
              </div>
            </>
          )}
          {key === "age" && (
            <>
              <h1 className="text-2xl font-bold">{t("onboarding.ageTitle")}</h1>
              <div className="grid grid-cols-2 gap-2">
                {AGE_RANGES.map((a) => (
                  <Chip key={a} selected={p.ageRange === a} onClick={() => setP({ ...p, ageRange: a })}>
                    {t(`ranges.age.${a}`)}
                  </Chip>
                ))}
              </div>
            </>
          )}
          {key === "employment" && (
            <>
              <h1 className="text-2xl font-bold">{t("onboarding.employmentTitle")}</h1>
              <div className="grid grid-cols-2 gap-2">
                {EMPLOYMENT.map((e) => (
                  <Chip key={e} selected={p.employment === e} onClick={() => setP({ ...p, employment: e, mode: e === "student" ? "student" : "standard" })}>
                    {t(`onboarding.employment.${e}`)}
                  </Chip>
                ))}
              </div>
            </>
          )}
          {key === "income" && (
            <>
              <h1 className="text-2xl font-bold">{t("onboarding.incomeTitle")}</h1>
              <p className="text-muted">{t("onboarding.incomeSubtitle")}</p>
              <Segmented
                label={t("onboarding.incomeTitle")}
                value={incomeMode}
                onChange={setIncomeMode}
                options={[
                  { value: "range", label: t("onboarding.incomeRange") },
                  { value: "exact", label: t("onboarding.incomeExact") },
                ]}
              />
              {incomeMode === "range" ? (
                <div className="flex flex-col gap-2">
                  {INCOME_RANGES.map((r) => (
                    <Chip key={r} selected={p.incomeRange === r} onClick={() => setP({ ...p, incomeRange: r })}>
                      {t(`ranges.${r}`)}
                    </Chip>
                  ))}
                </div>
              ) : (
                <MoneyInput label={t("onboarding.incomeTitle")} value={amounts.income} onChange={(v) => setAmounts({ ...amounts, income: v })} big />
              )}
            </>
          )}
          {(key === "expenses" || key === "savings" || key === "debt") && (
            <>
              <h1 className="text-2xl font-bold">{t(`onboarding.${key}Title`)}</h1>
              <p className="text-muted">{t("common.optional")}</p>
              <MoneyInput label={t(`onboarding.${key}Title`)} value={amounts[key]} onChange={(v) => setAmounts({ ...amounts, [key]: v })} big />
            </>
          )}
          {key === "goal" && (
            <>
              <h1 className="text-2xl font-bold">{t("onboarding.goalTitle")}</h1>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_TYPES.map((g) => (
                  <Chip key={g} selected={p.primaryGoal === g} onClick={() => setP({ ...p, primaryGoal: g })}>
                    {t(`goals.types.${g}`)}
                  </Chip>
                ))}
              </div>
            </>
          )}
          {optional && <p className="text-sm text-muted">{t("onboarding.privacyNote")}</p>}
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto flex gap-3 pt-8">
        {key !== "help" && (
          <Button variant="quiet" size="lg" className="flex-1" onClick={next}>
            {t("common.skip")}
          </Button>
        )}
        <Button size="lg" className="flex-[2]" disabled={!canContinue} onClick={next}>
          {step === STEPS.length - 1 ? t("common.done") : t("common.continue")}
        </Button>
      </div>
    </AuthLayout>
  );
}
