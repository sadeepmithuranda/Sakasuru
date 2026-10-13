import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Shield, Lock, Bell, Download, LogOut, Link2, Info, Smartphone } from "lucide-react";
import { LANGUAGES, type Lang } from "@sakasuru/localization";
import { APP_MODES } from "@sakasuru/validation";
import type { Preferences } from "@sakasuru/validation";
import { api, useSession } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useNotifications } from "@/lib/queries";
import { renderNotification, badgeByKey } from "@/lib/format";
import { downloadJson } from "@/lib/util";
import { Button, EmptyState, PageHeader, Section, Segmented, SelectInput, TextInput, Toggle, useToast } from "@/components/ui";
import { useTheme, THEME_CHOICES } from "@/lib/theme";
import { cx } from "@/lib/util";

function Row({ to, icon: Icon, label }: { to: string; icon: typeof Shield; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-4 hover:bg-surface">
      <Icon className="size-5 text-brand-600" aria-hidden />
      <span className="flex-1 font-semibold">{label}</span>
      <ChevronRight className="size-5 text-muted" />
    </Link>
  );
}

export function ProfilePage() {
  const theme = useTheme();
  const { t, setLang, lang } = useI18n();
  const { me, setMe } = useSession();
  const nav = useNavigate();
  const toast = useToast();
  const [name, setName] = useState(me?.profile.name ?? "");
  if (!me) return null;
  const savePrefs = async (p: Partial<Preferences>) => {
    const preferences = await api.updatePreferences(p);
    setMe({ ...me, preferences });
  };
  const saveProfile = async (p: Parameters<typeof api.updateProfile>[0]) => {
    const profile = await api.updateProfile(p);
    setMe({ ...me, profile });
    toast(t("common.saved"));
  };
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("profile.title")} subtitle={me.user.email} />

      <Section title={t("profile.personal")} className="mt-0">
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <TextInput label={t("auth.name")} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
            </div>
            <Button variant="secondary" disabled={!name.trim() || name === me.profile.name} onClick={() => saveProfile({ name: name.trim() })}>
              {t("common.save")}
            </Button>
          </div>
          <SelectInput
            label={t("profile.language")}
            value={lang}
            onChange={async (e) => {
              setLang(e.target.value as Lang);
              await saveProfile({ language: e.target.value as Lang });
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </SelectInput>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-soft">{t("profile.mode")}</p>
            <Segmented label={t("profile.mode")} value={me.profile.mode} onChange={(m) => saveProfile({ mode: m })} options={APP_MODES.map((m) => ({ value: m, label: t(`profile.modes.${m}`) }))} />
            {me.profile.mode === "student" && <p className="mt-2 text-sm text-muted">{t("modes.studentBody")}</p>}
            {(me.profile.mode === "family" || me.profile.mode === "business") && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-600">{t("common.comingSoon")}</p>}
          </div>
        </div>
      </Section>

      <Section title={t("profile.financial")}>
        <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-5">
          <div className="py-3">
            <p className="mb-2 font-semibold">{t("profile.appearance")}</p>
            <Segmented label={t("profile.appearance")} value={theme.choice} onChange={theme.setChoice} options={THEME_CHOICES.map((c) => ({ value: c, label: t(`profile.themes.${c}`) }))} />
            <p className="mt-2 text-sm text-muted">{t("profile.themeHint")}</p>
          </div>
          <Toggle checked={me.preferences.dataSaver} onChange={(v) => savePrefs({ dataSaver: v })} label={t("profile.dataSaver")} description={t("profile.dataSaverBody")} />
          <Toggle checked={me.preferences.reducedMotion} onChange={(v) => savePrefs({ reducedMotion: v })} label={t("profile.reducedMotion")} />
          <Toggle checked={me.preferences.highContrast} onChange={(v) => savePrefs({ highContrast: v })} label={t("profile.highContrast")} />
          <div className="py-3">
            <p className="mb-2 font-semibold">{t("profile.textSize")}</p>
            <Segmented
              label={t("profile.textSize")}
              value={String(me.preferences.textScale)}
              onChange={(v) => savePrefs({ textScale: Number(v) })}
              options={[
                { value: "0.9", label: "A−" },
                { value: "1", label: "A" },
                { value: "1.15", label: "A+" },
                { value: "1.3", label: "A++" },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t("notifications.preferences")}>
        <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-5">
          <Toggle checked={me.preferences.notifyBills} onChange={(v) => savePrefs({ notifyBills: v })} label={t("notifications.prefs.bills")} />
          <Toggle checked={me.preferences.notifyBudget} onChange={(v) => savePrefs({ notifyBudget: v })} label={t("notifications.prefs.budget")} />
          <Toggle checked={me.preferences.notifyGoals} onChange={(v) => savePrefs({ notifyGoals: v })} label={t("notifications.prefs.goals")} />
          <Toggle checked={me.preferences.notifyLearning} onChange={(v) => savePrefs({ notifyLearning: v })} label={t("notifications.prefs.learning")} />
          <Toggle checked onChange={() => undefined} disabled label={t("notifications.prefs.security")} />
        </div>
      </Section>

      <Section>
        <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
          <Row to="/profile/privacy" icon={Shield} label={`${t("profile.privacy")} · ${t("profile.aiPermissions")}`} />
          <Row to="/profile/security" icon={Lock} label={t("profile.security")} />
          <Row to="/notifications" icon={Bell} label={t("profile.notifications")} />
          <Row to="/achievements" icon={Info} label={t("profile.learningLevel")} />
        </div>
      </Section>

      <Section title={t("profile.connected")}>
        <div className="flex gap-3 rounded-[var(--radius-card)] bg-surface p-4 text-sm text-ink-soft">
          <Link2 className="size-5 shrink-0 text-muted" /> {t("profile.connectedBody")}
        </div>
      </Section>

      <Section title={t("profile.about")}>
        <p className="text-sm leading-relaxed text-muted">{t("app.educationalNotice")}</p>
        <p className="mt-2 text-xs text-muted">{t("profile.version", { v: "0.1.0" })} · {api.mode === "local" ? "on-device demo" : "cloud"}</p>
      </Section>

      <Button
        variant="quiet"
        className="mt-8 w-full"
        onClick={async () => {
          await api.logout();
          setMe(null);
          nav("/welcome");
        }}
      >
        <LogOut className="size-4" /> {t("auth.logout")}
      </Button>
    </div>
  );
}

export function PrivacyPage() {
  const { t } = useI18n();
  const { me, setMe } = useSession();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  if (!me) return null;
  const setConsent = async (c: Partial<typeof me.consents>) => {
    const consents = await api.updateConsents(c);
    setMe({ ...me, consents });
  };
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("privacy.title")} subtitle={t("privacy.intro")} back={<Link to="/profile" className="mb-2 inline-block text-sm font-semibold text-brand-800">← {t("profile.title")}</Link>} />
      <p className="rounded-2xl bg-brand-50 p-4 font-medium text-brand-800">{t("privacy.promises")}</p>
      <Section title={t("profile.aiPermissions")}>
        <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-5">
          <Toggle checked={me.consents.aiDataAccess} onChange={(v) => setConsent({ aiDataAccess: v })} label={t("privacy.aiAccess")} description={t("privacy.aiAccessBody")} />
          <Toggle checked={me.consents.aiHistory} onChange={(v) => setConsent({ aiHistory: v })} label={t("privacy.aiHistory")} />
          <Toggle checked={me.consents.analytics} onChange={(v) => setConsent({ analytics: v })} label={t("privacy.analytics")} description={t("privacy.analyticsBody")} />
        </div>
      </Section>
      <Section>
        <Button variant="quiet" className="w-full" onClick={async () => downloadJson(await api.exportData(), `sakasuru-export-${new Date().toISOString().slice(0, 10)}.json`)}>
          <Download className="size-4" /> {t("privacy.export")}
        </Button>
      </Section>
      <Section title={t("privacy.deleteTitle")}>
        <div className="rounded-[var(--radius-card)] border border-alert-500/30 bg-alert-50 p-5">
          <p className="text-ink">{t("privacy.deleteBody")}</p>
          <div className="mt-4">
            <TextInput label={t("privacy.deleteConfirm")} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
          </div>
          <Button
            variant="danger"
            className="mt-4 w-full"
            disabled={confirm !== "DELETE"}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await api.deleteAccount();
              setMe(null);
              nav("/welcome");
            }}
          >
            {t("profile.deleteAccount")}
          </Button>
        </div>
      </Section>
    </div>
  );
}

export function SecurityPage() {
  const { t, date } = useI18n();
  const toast = useToast();
  const qc = useQueryClient();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { data: sessions } = useQuery({ queryKey: ["sessions"], queryFn: () => api.sessions() });
  const change = useMutation({
    mutationFn: () => api.changePassword(cur, next),
    onSuccess: () => (toast(t("security.passwordChanged")), setCur(""), setNext(""), setErr(null), qc.invalidateQueries({ queryKey: ["sessions"] })),
    onError: () => setErr(t("auth.invalid")),
  });
  const revoke = useMutation({ mutationFn: api.revokeSession, onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }) });
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("security.title")} back={<Link to="/profile" className="mb-2 inline-block text-sm font-semibold text-brand-800">← {t("profile.title")}</Link>} />
      <Section title={t("security.changePassword")} className="mt-0">
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5">
          <TextInput label={t("security.currentPassword")} type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
          <TextInput label={t("security.newPassword")} type="password" autoComplete="new-password" hint={t("auth.passwordHint")} value={next} onChange={(e) => setNext(e.target.value)} error={err} />
          <Button disabled={!cur || next.length < 10} loading={change.isPending} onClick={() => change.mutate()}>
            {t("security.changePassword")}
          </Button>
        </div>
      </Section>
      <Section title={t("security.sessions")}>
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-4">
          {sessions?.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <Smartphone className="size-5 text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{s.userAgent ?? "—"}</span>
                <span className="text-xs text-muted">
                  {s.current ? t("security.thisDevice") : t("security.lastActive", { date: date(s.lastUsedAt) })}
                </span>
              </span>
              {!s.current && (
                <Button size="sm" variant="quiet" onClick={() => revoke.mutate(s.id)}>
                  {t("security.revoke")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Section>
      <Section title={t("security.twoFactor")}>
        <p className="rounded-2xl bg-surface p-4 text-sm text-muted">{t("security.twoFactorBody")}</p>
      </Section>
    </div>
  );
}

export function NotificationsPage() {
  const { t, money, pick, date } = useI18n();
  const { data, isLoading } = useNotifications();
  const qc = useQueryClient();
  const readAll = useMutation({ mutationFn: api.readAllNotifications, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const read = useMutation({ mutationFn: api.readNotification, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("notifications.title")} action={data?.some((n) => !n.read) ? <Button size="sm" variant="ghost" onClick={() => readAll.mutate()}>{t("notifications.markAll")}</Button> : undefined} />
      {isLoading ? null : data?.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
          {data.map((n) => (
            <li key={n.id}>
              <button onClick={() => !n.read && read.mutate(n.id)} className={cx("flex w-full gap-3 px-4 py-4 text-left", !n.read && "bg-brand-50/60")}>
                <span className={cx("mt-2 size-2.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-accent-400")} aria-hidden />
                <span className="flex-1">
                  <span className={cx("block", !n.read && "font-semibold")}>{renderNotification(t, money, n, (k) => (badgeByKey(k) ? pick(badgeByKey(k)!.title) : k))}</span>
                  <span className="text-xs text-muted">{date(n.createdAt)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="🔔" title={t("notifications.empty")} />
      )}
      <Link to="/profile" className="mt-6 inline-block text-sm font-semibold text-brand-800">
        {t("notifications.preferences")}
      </Link>
    </div>
  );
}
