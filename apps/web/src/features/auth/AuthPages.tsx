import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { LANGUAGES, type Lang } from "@sakasuru/localization";
import { api, useSession } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { ApiError } from "@/data/api";
import { AuthLayout } from "@/components/layout/AppShell";
import { Button, TextInput } from "@/components/ui";
import { LogoMark } from "@/components/brand";
import { cx } from "@/lib/util";

export function WelcomePage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { setMe } = useSession();
  const [loading, setLoading] = useState(false);
  const demo = async () => {
    setLoading(true);
    const r = await api.startDemo!();
    setMe(r.me);
    nav("/");
  };
  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <section className="relative flex flex-col justify-between overflow-hidden bg-brand-600 px-6 pb-10 pt-8 text-white lg:w-1/2 lg:px-14 lg:py-14">
        <div className="flex items-center gap-3">
          <LogoMark size={44} inverted />
          <span className="text-sm font-semibold tracking-wide text-white/80">Sakasuru</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-14 lg:mt-0">
          <h1 className="text-[64px] font-bold leading-none lg:text-[104px]" style={{ fontFamily: "Yaldevi, var(--font-sans)" }}>
            සකසුරු
          </h1>
          <p className="mt-6 max-w-md text-2xl font-medium leading-snug text-white/95" style={{ fontFamily: "Yaldevi, var(--font-sans)" }}>
            දැනගෙන උපයමු.
            <br />
            හිතලා වියදම් කරමු.
            <br />
            හෙටට ඉතිරි කරමු.
          </p>
          <p className="mt-4 text-base text-white/75">Learn Money. Manage Better. Build Tomorrow.</p>
        </motion.div>
        <div className="dumbara absolute inset-x-0 bottom-0 h-2.5 opacity-90 lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-2.5" aria-hidden />
      </section>

      <section className="flex flex-1 flex-col justify-center px-6 py-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-[28px] font-bold leading-tight">{t("welcome.title")}</h2>
          <p className="mt-3 text-lg text-ink-soft">{t("welcome.body")}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {["point1", "point2", "point3"].map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800">
                  <Check className="size-4" />
                </span>
                <span>{t(`welcome.${p}`)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <Button size="lg" onClick={() => nav("/language")}>
              {t("welcome.getStarted")}
            </Button>
            <Button size="lg" variant="quiet" onClick={() => nav("/login")}>
              {t("welcome.haveAccount")}
            </Button>
            {api.startDemo && (
              <Button size="lg" variant="ghost" onClick={demo} loading={loading}>
                {t("welcome.tryDemo")}
              </Button>
            )}
          </div>
          <p className="mt-8 text-xs leading-relaxed text-muted">{t("app.educationalNotice")}</p>
        </div>
      </section>
    </div>
  );
}

export function LanguagePage() {
  const { t, lang, setLang } = useI18n();
  const nav = useNavigate();
  const samples: Record<Lang, string> = { si: "මුදල් ගැන ඉගෙන ගනිමු", ta: "பணம் பற்றிக் கற்போம்", en: "Let's learn about money" };
  return (
    <AuthLayout>
      <h1 className="mt-6 text-[28px] font-bold">{t("language.title")}</h1>
      <p className="mt-2 text-muted">{t("language.subtitle")}</p>
      <div className="mt-8 flex flex-col gap-3" role="radiogroup" aria-label={t("language.title")}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            role="radio"
            aria-checked={lang === l.code}
            onClick={() => setLang(l.code)}
            className={cx("flex items-center justify-between rounded-[var(--radius-card)] border-2 p-5 text-left transition-colors", lang === l.code ? "border-brand-500 bg-brand-50" : "border-line bg-card hover:border-brand-300")}
          >
            <span>
              <span className="block text-2xl font-bold">{l.native}</span>
              <span className="mt-1 block text-sm text-muted">{samples[l.code]}</span>
            </span>
            <span className={cx("grid size-7 place-items-center rounded-full border-2", lang === l.code ? "border-brand-600 bg-brand-600 text-white" : "border-line")}>{lang === l.code && <Check className="size-4" />}</span>
          </button>
        ))}
      </div>
      <Button size="lg" className="mt-auto w-full" onClick={() => nav("/register")}>
        {t("common.continue")}
      </Button>
    </AuthLayout>
  );
}

export function LoginPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { setMe } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await api.login(email, password);
      setMe(r.me);
      nav(r.me.profile.onboardingCompleted ? "/" : "/onboarding");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? t("auth.tooMany") : err instanceof ApiError && err.status === 401 ? t("auth.invalid") : t("common.error"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <h1 className="mt-6 text-[28px] font-bold">{t("auth.loginTitle")}</h1>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        <TextInput label={t("auth.email")} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextInput label={t("auth.password")} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && (
          <p className="rounded-xl bg-alert-50 p-3 text-sm font-medium text-alert-500" role="alert">
            {error}
          </p>
        )}
        <Button size="lg" type="submit" loading={loading}>
          {t("auth.login")}
        </Button>
        <button type="button" onClick={() => setShowReset((s) => !s)} className="self-start text-sm font-semibold text-brand-800">
          {t("auth.forgot")}
        </button>
        {showReset && <p className="rounded-xl bg-learn-50 p-3 text-sm text-learn-700">{t("auth.resetUnavailable")}</p>}
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        {t("auth.noAccount")}{" "}
        <Link to="/language" className="font-semibold text-brand-800">
          {t("auth.register")}
        </Link>
      </p>
      {api.mode === "local" && <p className="mt-4 text-center text-xs text-muted">{t("auth.demoNote")}</p>}
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const { setMe } = useSession();
  const [form, setForm] = useState({ name: "", email: "", password: "", accept: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 10) return setError(t("auth.weakPassword"));
    if (!form.accept) return setError(t("auth.consentTerms"));
    setLoading(true);
    setError(null);
    try {
      const r = await api.register({ name: form.name.trim() || "Friend", email: form.email, password: form.password, language: lang, acceptTerms: true });
      setMe(r.me);
      nav("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? t("auth.emailTaken") : err instanceof ApiError && err.status === 400 ? t("auth.weakPassword") : t("common.error"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <h1 className="mt-6 text-[28px] font-bold">{t("auth.registerTitle")}</h1>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        <TextInput label={t("onboarding.nameTitle")} placeholder={t("onboarding.namePlaceholder")} autoComplete="given-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} />
        <TextInput label={t("auth.email")} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <TextInput label={t("auth.password")} type="password" autoComplete="new-password" hint={t("auth.passwordHint")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input type="checkbox" checked={form.accept} onChange={(e) => setForm({ ...form, accept: e.target.checked })} className="mt-1 size-5 accent-brand-600" />
          {t("auth.consentTerms")}
        </label>
        <p className="text-sm text-muted">{t("onboarding.privacyNote")}</p>
        {error && (
          <p className="rounded-xl bg-alert-50 p-3 text-sm font-medium text-alert-500" role="alert">
            {error}
          </p>
        )}
        <Button size="lg" type="submit" loading={loading}>
          {t("auth.register")}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="font-semibold text-brand-800">
          {t("auth.login")}
        </Link>
      </p>
    </AuthLayout>
  );
}
