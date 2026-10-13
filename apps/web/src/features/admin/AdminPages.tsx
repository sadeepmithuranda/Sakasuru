import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Plus, Trash2, AlertTriangle, ShieldCheck } from "lucide-react";
import { COURSES, ALL_LESSONS, type L } from "@sakasuru/content";
import type { ContentStatus, LessonUpsert, RoleName } from "@sakasuru/validation";
import { api, useSession } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { Button, EmptyState, PageHeader, SelectInput, Skeleton, TextInput, Toggle, useToast } from "@/components/ui";
import { cx } from "@/lib/util";

const RANK: Record<RoleName, number> = { user: 0, creator: 1, reviewer: 2, moderator: 3, admin: 4, superadmin: 5 };
const STATUS_STYLE: Record<ContentStatus, string> = { draft: "bg-surface text-ink-soft", review: "bg-lagoon-50 text-lagoon-700", approved: "bg-saffron-100 text-saffron-700", published: "bg-leaf-50 text-leaf-800", archived: "bg-line text-muted" };

export function AdminLayout() {
  const { t } = useI18n();
  const { me } = useSession();
  if (!me || RANK[me.user.role] < 1) return <EmptyState icon="🔒" title={t("admin.forbidden")} />;
  const tabs = [
    { to: "/admin", label: t("admin.analytics"), end: true, min: 3 },
    { to: "/admin/content", label: t("admin.content"), min: 1 },
    { to: "/admin/users", label: t("admin.users"), min: 4 },
    { to: "/admin/audit", label: t("admin.audit"), min: 4 },
  ].filter((x) => RANK[me.user.role] >= x.min);
  return (
    <div>
      <PageHeader title={t("admin.title")} subtitle={t(`admin.roles.${me.user.role}`)} />
      <nav className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4" aria-label={t("admin.title")}>
        {tabs.map((x) => (
          <NavLink key={x.to} to={x.to} end={x.end} className={({ isActive }) => cx("whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold", isActive ? "bg-inverse text-on-inverse" : "bg-card text-ink-soft border border-line")}>
            {x.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

export function AdminDashboard() {
  const { t, pick } = useI18n();
  const { me } = useSession();
  const { data: s, isLoading, isError } = useQuery({ queryKey: ["admin-stats"], queryFn: () => api.adminStats(), enabled: !!me && RANK[me.user.role] >= 3 });
  if (me && RANK[me.user.role] < 3) return <Link to="/admin/content" className="font-semibold text-leaf-800">{t("admin.content")} →</Link>;
  if (isLoading) return <Skeleton className="h-96" />;
  if (isError || !s) return <EmptyState icon="🔒" title={t("admin.forbidden")} />;
  const lessonTitle = (slug: string) => {
    const l = ALL_LESSONS.find((x) => x.lesson.slug === slug)?.lesson;
    return l ? pick(l.title) : slug;
  };
  return (
    <div>
      <p className="mb-4 flex gap-2 rounded-2xl bg-lagoon-50 p-3 text-sm text-lagoon-700">
        <ShieldCheck className="size-5 shrink-0" /> {t("admin.privacyNote")}
      </p>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["users", s.users],
          ["active", s.activeUsers30d],
          ["lessons", s.lessonsCompleted],
          ["quizRate", `${s.quizSuccessRate}%`],
          ["budgets", s.budgets],
          ["goals", s.goals],
        ].map(([k, v]) => (
          <div key={k as string} className="bg-card p-4">
            <dt className="text-sm text-muted">{t(`admin.stats.${k}`)}</dt>
            <dd className="figure mt-1 text-2xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
          <h2 className="font-bold">{t("admin.stats.users")}</h2>
          <div className="mt-3 h-52">
            <ResponsiveContainer>
              <BarChart data={s.signupsByDay}>
                <CartesianGrid stroke="var(--color-track)" vertical={false} />
                <XAxis dataKey="day" tickFormatter={(d) => String(d).slice(5)} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={11} width={24} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-leaf-500)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
          <h2 className="font-bold">{t("admin.languageSplit")}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {s.languages.map((l) => (
              <li key={l.lang}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{t(`language.${l.lang}`)}</span>
                  <span>{l.count}</span>
                </div>
                <div className="mt-1 h-2.5 rounded-full bg-leaf-50">
                  <div className="h-full rounded-full bg-lagoon-500" style={{ width: `${(l.count / Math.max(s.users, 1)) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
          <h2 className="font-bold">{t("admin.hardestLessons")}</h2>
          <ol className="mt-3 flex flex-col gap-2 text-sm">
            {s.hardestLessons.length ? s.hardestLessons.map((h) => (
              <li key={h.slug} className="flex justify-between gap-3">
                <span>{lessonTitle(h.slug)}</span>
                <span className="figure font-semibold">{h.avgScore}% · {h.attempts}</span>
              </li>
            )) : <li className="text-muted">—</li>}
          </ol>
        </section>
        <section className="rounded-[var(--radius-card)] border border-line bg-card p-5">
          <h2 className="font-bold">{t("admin.topQuestions")}</h2>
          <ol className="mt-3 flex flex-col gap-2 text-sm">
            {s.topAiTopics.length ? s.topAiTopics.map((x) => (
              <li key={x.topic} className="flex justify-between gap-3">
                <span>{x.topic}</span>
                <span className="figure font-semibold">{x.count}</span>
              </li>
            )) : <li className="text-muted">—</li>}
          </ol>
        </section>
      </div>
    </div>
  );
}

export function AdminContent() {
  const { t, pick, date } = useI18n();
  const [filter, setFilter] = useState<ContentStatus | "all">("all");
  const { data, isLoading } = useQuery({ queryKey: ["admin-lessons"], queryFn: () => api.adminLessons() });
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  if (isLoading) return <Skeleton className="h-96" />;
  const rows = (data ?? []).filter((r) => filter === "all" || r.status === filter);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", "draft", "review", "approved", "published", "archived"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cx("rounded-full px-3 py-1.5 text-sm font-semibold", filter === s ? "bg-leaf-600 text-white" : "border border-line bg-card")}>
              {s === "all" ? t("money.filters.all") : t(`admin.status.${s}`)}
            </button>
          ))}
        </div>
        <Link to="/admin/content/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-leaf-600 px-4 text-sm font-semibold text-white">
          <Plus className="size-4" /> {t("admin.newLesson")}
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("admin.lessons")}</th>
              <th className="px-4 py-3 font-semibold">{t("learn.courses")}</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">{t("admin.nextReview")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.slug} className="hover:bg-surface">
                <td className="px-4 py-3">
                  <Link to={`/admin/content/${r.slug}`} className="font-semibold text-leaf-800 hover:underline">
                    {pick(r.title)}
                  </Link>
                  <span className="block text-xs text-muted">{r.slug}</span>
                </td>
                <td className="px-4 py-3">{pick(COURSES.find((c) => c.slug === r.courseSlug)?.title ?? { en: r.courseSlug, si: r.courseSlug, ta: r.courseSlug })}</td>
                <td className="px-4 py-3">
                  <span className={cx("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[r.status])}>{t(`admin.status.${r.status}`)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cx(r.nextReview <= today ? "font-semibold text-alert-500" : r.nextReview <= soon ? "text-amber-600" : "")}>{date(r.nextReview)}</span>
                  {r.timeSensitive && <AlertTriangle className="ml-1 inline size-4 text-amber-600" aria-label={t("learn.timeSensitive")} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const emptyL = (): L => ({ en: "", si: "", ta: "" });
const blankLesson = (): LessonUpsert => ({
  slug: "",
  courseSlug: COURSES[0]!.slug,
  title: emptyL(),
  summary: emptyL(),
  minutes: 3,
  xp: 20,
  tags: [],
  timeSensitive: false,
  protection: false,
  cards: [{ type: "story", body: emptyL() }],
  quiz: [0, 1, 2].map((i) => ({ id: `q${i + 1}`, type: "mcq" as const, prompt: emptyL(), options: [{ id: "a", text: emptyL() }, { id: "b", text: emptyL() }], correctId: "a", explanation: emptyL() })),
  sources: [{ name: "Central Bank of Sri Lanka", url: "https://www.cbsl.gov.lk" }],
});

function LField({ label, value, onChange, multiline }: { label: string; value: L; onChange: (v: L) => void; multiline?: boolean }) {
  return (
    <fieldset className="rounded-2xl border border-line p-3">
      <legend className="px-1 text-sm font-semibold text-ink-soft">{label}</legend>
      <div className="grid gap-2 md:grid-cols-3">
        {(["si", "ta", "en"] as const).map((lng) =>
          multiline ? (
            <textarea key={lng} aria-label={`${label} (${lng})`} placeholder={lng.toUpperCase()} value={value[lng]} onChange={(e) => onChange({ ...value, [lng]: e.target.value })} rows={3} className="rounded-xl border border-line bg-card p-2.5 text-sm focus:border-leaf-500 focus:outline-none" />
          ) : (
            <input key={lng} aria-label={`${label} (${lng})`} placeholder={lng.toUpperCase()} value={value[lng]} onChange={(e) => onChange({ ...value, [lng]: e.target.value })} className="h-10 rounded-xl border border-line bg-card px-2.5 text-sm focus:border-leaf-500 focus:outline-none" />
          ),
        )}
      </div>
    </fieldset>
  );
}

export function AdminLessonEditor() {
  const { slug } = useParams();
  const isNew = !slug || slug === "new";
  const { t } = useI18n();
  const { me } = useSession();
  const nav = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: existing } = useQuery({ queryKey: ["admin-lesson", slug], queryFn: () => api.adminLesson(slug!), enabled: !isNew });
  const [l, setL] = useState<LessonUpsert>(blankLesson());
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (existing) {
      const { status: st, lastReviewed: _lr, ...rest } = existing;
      setL({ ...rest, nextReview: existing.nextReview } as LessonUpsert);
      setStatus(st as ContentStatus);
    }
  }, [existing]);
  const save = useMutation({
    mutationFn: () => api.adminSaveLesson(l),
    onSuccess: (r) => {
      setStatus(r.status as ContentStatus);
      toast(t("common.saved"));
      qc.invalidateQueries({ queryKey: ["admin-lessons"] });
      if (isNew) nav(`/admin/content/${l.slug}`, { replace: true });
    },
    onError: () => setError(t("common.error")),
  });
  const move = useMutation({
    mutationFn: (s: ContentStatus) => api.adminSetLessonStatus(l.slug, s),
    onSuccess: (_r, s) => (setStatus(s), qc.invalidateQueries({ queryKey: ["admin-lessons"] }), qc.invalidateQueries({ queryKey: ["courses"] }), toast(t(`admin.status.${s}`))),
    onError: () => toast(t("admin.forbidden"), "error"),
  });
  const role = me?.user.role ?? "user";
  const actions: { to: ContentStatus; label: string; min: RoleName; from: ContentStatus[] }[] = [
    { to: "review", label: t("admin.submitReview"), min: "creator", from: ["draft"] },
    { to: "approved", label: t("admin.approve"), min: "reviewer", from: ["review"] },
    { to: "published", label: t("admin.publish"), min: "admin", from: ["approved", "archived"] },
    { to: "archived", label: t("admin.archive"), min: "admin", from: ["draft", "review", "approved", "published"] },
  ];
  const patchCard = (i: number, c: Partial<LessonUpsert["cards"][number]>) => setL({ ...l, cards: l.cards.map((x, k) => (k === i ? { ...x, ...c } : x)) });
  const patchQ = (i: number, q: Partial<LessonUpsert["quiz"][number]>) => setL({ ...l, quiz: l.quiz.map((x, k) => (k === i ? { ...x, ...q } : x)) });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{isNew ? t("admin.newLesson") : t("admin.editLesson")}</h2>
        <span className={cx("rounded-full px-3 py-1 text-sm font-semibold", STATUS_STYLE[status])}>{t(`admin.status.${status}`)}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Slug" value={l.slug} disabled={!isNew} onChange={(e) => setL({ ...l, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} hint="a-z, 0-9, -" />
        <SelectInput label={t("learn.courses")} value={l.courseSlug} onChange={(e) => setL({ ...l, courseSlug: e.target.value })}>
          {COURSES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.level}. {c.title.en}
            </option>
          ))}
        </SelectInput>
        <TextInput label="Minutes" type="number" min={1} max={30} value={l.minutes} onChange={(e) => setL({ ...l, minutes: Number(e.target.value) || 1 })} />
        <TextInput label="XP" type="number" min={0} max={200} value={l.xp} onChange={(e) => setL({ ...l, xp: Number(e.target.value) || 0 })} />
      </div>
      <LField label="Title" value={l.title} onChange={(v) => setL({ ...l, title: v })} />
      <LField label="Summary" value={l.summary} onChange={(v) => setL({ ...l, summary: v })} />
      <div className="grid gap-x-6 md:grid-cols-2">
        <Toggle checked={!!l.timeSensitive} onChange={(v) => setL({ ...l, timeSensitive: v })} label={t("learn.timeSensitive")} />
        <Toggle checked={!!l.protection} onChange={(v) => setL({ ...l, protection: v })} label={t("health.factors.protection")} />
      </div>

      <h3 className="text-lg font-bold">Cards</h3>
      {l.cards.map((c, i) => (
        <div key={i} className="rounded-[var(--radius-card)] border border-line bg-card p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="font-bold">{i + 1}</span>
            <select value={c.type} onChange={(e) => patchCard(i, { type: e.target.value as never })} className="h-9 rounded-lg border border-line bg-card px-2 text-sm">
              {["story", "concept", "example", "tip", "warning"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <button onClick={() => setL({ ...l, cards: l.cards.filter((_, k) => k !== i) })} disabled={l.cards.length === 1} className="ml-auto grid size-9 place-items-center rounded-full text-muted hover:text-alert-500 disabled:opacity-30" aria-label={t("common.delete")}>
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <LField label="Title" value={c.title ?? emptyL()} onChange={(v) => patchCard(i, { title: v })} />
            <LField label="Body" value={c.body} onChange={(v) => patchCard(i, { body: v })} multiline />
          </div>
        </div>
      ))}
      <Button variant="secondary" onClick={() => setL({ ...l, cards: [...l.cards, { type: "concept", body: emptyL() }] })}>
        <Plus className="size-4" /> Card
      </Button>

      <h3 className="text-lg font-bold">{t("learn.quizTitle")}</h3>
      {l.quiz.map((q, i) => (
        <div key={q.id} className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-card p-4">
          <p className="font-bold">{t("learn.question", { n: i + 1, total: l.quiz.length })}</p>
          <LField label="Prompt" value={q.prompt} onChange={(v) => patchQ(i, { prompt: v })} />
          {q.options.map((o, k) => (
            <div key={o.id} className="flex items-start gap-2">
              <input type="radio" name={`correct-${q.id}`} checked={q.correctId === o.id} onChange={() => patchQ(i, { correctId: o.id })} className="mt-6 size-5 accent-leaf-600" aria-label={`correct ${o.id}`} />
              <div className="flex-1">
                <LField label={`Option ${o.id}`} value={o.text} onChange={(v) => patchQ(i, { options: q.options.map((x, j) => (j === k ? { ...x, text: v } : x)) })} />
              </div>
            </div>
          ))}
          {q.options.length < 4 && (
            <button onClick={() => patchQ(i, { options: [...q.options, { id: "abcdef"[q.options.length]!, text: emptyL() }] })} className="self-start text-sm font-semibold text-leaf-800">
              + Option
            </button>
          )}
          <LField label="Explanation" value={q.explanation} onChange={(v) => patchQ(i, { explanation: v })} multiline />
        </div>
      ))}
      {l.quiz.length < 10 && (
        <Button variant="secondary" onClick={() => setL({ ...l, quiz: [...l.quiz, { id: `q${l.quiz.length + 1}`, type: "mcq", prompt: emptyL(), options: [{ id: "a", text: emptyL() }, { id: "b", text: emptyL() }], correctId: "a", explanation: emptyL() }] })}>
          <Plus className="size-4" /> {t("learn.question", { n: l.quiz.length + 1, total: l.quiz.length + 1 })}
        </Button>
      )}

      <h3 className="text-lg font-bold">{t("common.sources")}</h3>
      {l.sources.map((s, i) => (
        <div key={i} className="grid gap-2 md:grid-cols-2">
          <TextInput label={t("common.source")} value={s.name} onChange={(e) => setL({ ...l, sources: l.sources.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} />
          <TextInput label="URL" type="url" value={s.url} onChange={(e) => setL({ ...l, sources: l.sources.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)) })} />
        </div>
      ))}
      <TextInput label={t("admin.nextReview")} type="date" value={l.nextReview ?? ""} onChange={(e) => setL({ ...l, nextReview: e.target.value || undefined })} />

      {error && <p className="text-sm text-alert-500">{error}</p>}
      <div className="sticky bottom-20 flex flex-wrap gap-2 rounded-[var(--radius-card)] border border-line bg-card p-3 shadow-[var(--shadow-lift)] lg:bottom-4">
        <Button onClick={() => save.mutate()} loading={save.isPending} disabled={!/^[a-z0-9-]{3,60}$/.test(l.slug) || !l.title.en}>
          {t("common.save")}
        </Button>
        {!isNew &&
          actions
            .filter((a) => a.from.includes(status) && RANK[role] >= RANK[a.min])
            .map((a) => (
              <Button key={a.to} variant={a.to === "archived" ? "quiet" : "secondary"} onClick={() => move.mutate(a.to)} loading={move.isPending && move.variables === a.to}>
                {a.label}
              </Button>
            ))}
      </div>
    </div>
  );
}

export function AdminUsers() {
  const { t, date } = useI18n();
  const { me } = useSession();
  const qc = useQueryClient();
  const toast = useToast();
  const [q, setQ] = useState("");
  const { data } = useQuery({ queryKey: ["admin-users", q], queryFn: () => api.adminUsers(q) });
  const set = useMutation({ mutationFn: ({ id, role }: { id: string; role: string }) => api.adminSetRole(id, role), onSuccess: () => (qc.invalidateQueries({ queryKey: ["admin-users"] }), toast(t("common.saved"))), onError: () => toast(t("admin.forbidden"), "error") });
  const myRank = RANK[me?.user.role ?? "user"];
  return (
    <div>
      <TextInput label={t("common.search")} value={q} onChange={(e) => setQ(e.target.value)} type="search" />
      <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-3">{t("auth.email")}</th>
              <th className="px-4 py-3">{t("profile.language")}</th>
              <th className="px-4 py-3">{t("admin.role")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data?.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <span className="font-semibold">{u.name}</span>
                  <span className="block text-xs text-muted">
                    {u.email} · {date(u.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">{u.language}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={u.id === me?.user.id || RANK[u.role as RoleName] >= myRank}
                    onChange={(e) => set.mutate({ id: u.id, role: e.target.value })}
                    className="h-9 rounded-lg border border-line bg-card px-2 disabled:opacity-60"
                    aria-label={`${t("admin.role")} ${u.email}`}
                  >
                    {(Object.keys(RANK) as RoleName[]).map((r) => (
                      <option key={r} value={r} disabled={RANK[r] >= myRank}>
                        {t(`admin.roles.${r}`)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminAudit() {
  const { date } = useI18n();
  const { data } = useQuery({ queryKey: ["admin-audit"], queryFn: () => api.adminAuditLogs() });
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-card">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-surface text-left text-muted">
          <tr>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Target</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data?.map((a) => (
            <tr key={a.id}>
              <td className="whitespace-nowrap px-4 py-2.5">
                {date(a.createdAt)} {new Date(a.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </td>
              <td className="px-4 py-2.5">{a.actor ?? "—"}</td>
              <td className="px-4 py-2.5 font-mono text-xs">{a.action}</td>
              <td className="max-w-[160px] truncate px-4 py-2.5 text-xs text-muted">{a.target ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
