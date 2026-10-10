import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { Home, GraduationCap, Wallet, Target, User, Plus, Sparkles, Bell, Calculator, ShieldCheck, LayoutDashboard, Trophy, WifiOff, Languages } from "lucide-react";
import { LANGUAGES, type Lang } from "@sakasuru/localization";
import { useI18n } from "@/lib/i18n";
import { api, useSession } from "@/lib/api-context";
import { useNotifications } from "@/lib/queries";
import { cx } from "@/lib/util";
import { Logo } from "@/components/brand";
import { AddTransactionSheet } from "@/features/money/AddTransactionSheet";

const QuickAddCtx = createContext<(type?: "expense" | "income") => void>(() => undefined);
export const useQuickAdd = () => useContext(QuickAddCtx);

function LanguageSwitch({ compact }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const { me, setMe } = useSession();
  const change = async (l: Lang) => {
    setLang(l);
    if (me) {
      const profile = await api.updateProfile({ language: l }).catch(() => null);
      if (profile) setMe({ ...me, profile });
    }
  };
  return (
    <label className={cx("relative inline-flex items-center gap-1.5 rounded-full border border-line bg-white text-sm font-semibold", compact ? "h-10 px-3" : "h-10 px-3.5")}>
      <Languages className="size-4 text-leaf-600" aria-hidden />
      <span className="sr-only">{t("profile.language")}</span>
      <select value={lang} onChange={(e) => change(e.target.value as Lang)} className="cursor-pointer appearance-none bg-transparent pr-1 focus:outline-none">
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}

function BellLink() {
  const { t } = useI18n();
  const { data } = useNotifications();
  const unread = data?.filter((n) => !n.read).length ?? 0;
  return (
    <Link to="/notifications" className="relative grid size-10 place-items-center rounded-full border border-line bg-white" aria-label={`${t("nav.notifications")}${unread ? ` (${unread})` : ""}`}>
      <Bell className="size-5" />
      {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-saffron-400 px-1 text-[11px] font-bold text-ink">{unread}</span>}
    </Link>
  );
}

export function AppShell() {
  const { t } = useI18n();
  const { me } = useSession();
  const location = useLocation();
  const [sheet, setSheet] = useState<{ open: boolean; type: "expense" | "income" }>({ open: false, type: "expense" });
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isStaff = me && me.user.role !== "user";
  const side = [
    { to: "/", icon: Home, label: t("nav.home"), end: true },
    { to: "/money", icon: Wallet, label: t("nav.money") },
    { to: "/goals", icon: Target, label: t("nav.goals") },
    { to: "/learn", icon: GraduationCap, label: t("nav.learn") },
    { to: "/achievements", icon: Trophy, label: t("learn.achievements") },
    { to: "/tools", icon: Calculator, label: t("nav.tools") },
    { to: "/scam-shield", icon: ShieldCheck, label: t("nav.scamShield") },
    { to: "/ask", icon: Sparkles, label: t("nav.ask") },
    { to: "/profile", icon: User, label: t("nav.profile") },
    ...(isStaff ? [{ to: "/admin", icon: LayoutDashboard, label: t("nav.admin") }] : []),
  ];
  const bottom = [
    { to: "/", icon: Home, label: t("nav.home"), end: true },
    { to: "/learn", icon: GraduationCap, label: t("nav.learn") },
    null,
    { to: "/money", icon: Wallet, label: t("nav.money") },
    { to: "/goals", icon: Target, label: t("nav.goals") },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];
  const openAdd = (type: "expense" | "income" = "expense") => setSheet({ open: true, type });
  const onAsk = location.pathname.startsWith("/ask");

  return (
    <QuickAddCtx.Provider value={openAdd}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        {t("app.skipToContent")}
      </a>
      <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-white px-4 py-6 lg:flex">
          <Link to="/" className="px-2">
            <Logo />
          </Link>
          <button onClick={() => openAdd()} className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-leaf-600 font-semibold text-white hover:bg-leaf-800">
            <Plus className="size-5" /> {t("nav.addExpense")}
          </button>
          <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="Main">
            {side.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx("flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold", isActive ? "bg-leaf-50 text-leaf-800" : "text-ink-soft hover:bg-surface")}>
                <n.icon className="size-5" aria-hidden />
                {n.label}
              </NavLink>
            ))}
          </nav>
          <p className="mt-4 px-2 text-xs leading-relaxed text-muted">{t("app.educationalNotice")}</p>
        </aside>

        <div className="min-w-0 overflow-x-clip">
          {api.mode === "local" && (
            <div className="bg-lagoon-700 px-4 py-2 text-center text-sm text-white">
              {t("app.demoBanner")}
            </div>
          )}
          {!online && (
            <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-600" role="status">
              <WifiOff className="size-4" /> {t("app.offline")}
            </div>
          )}
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-surface/90 px-4 py-3 backdrop-blur lg:px-10">
            <Link to="/" className="lg:invisible">
              <Logo size={32} />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitch compact />
              <BellLink />
            </div>
          </header>
          <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-36 pt-2 lg:px-10 lg:pb-16">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Floating Ask button (mobile) */}
      {!onAsk && (
        <Link
          to="/ask"
          className="fixed bottom-24 right-4 z-30 flex h-12 items-center gap-2 rounded-full border border-lagoon-500/20 bg-white pl-3.5 pr-4 font-semibold text-lagoon-700 shadow-[var(--shadow-lift)] lg:hidden"
        >
          <Sparkles className="size-5 text-saffron-400" aria-hidden /> {t("nav.ask")}
        </Link>
      )}

      {/* Mobile bottom navigation */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white lg:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-lg grid-cols-6 items-end px-1">
          {bottom.map((n, i) =>
            n ? (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx("flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold", isActive ? "text-leaf-700 text-leaf-800" : "text-muted")}>
                {({ isActive }) => (
                  <>
                    <n.icon className={cx("size-6", isActive && "text-leaf-600")} aria-hidden strokeWidth={isActive ? 2.4 : 1.8} />
                    <span className="max-w-full truncate px-0.5">{n.label}</span>
                  </>
                )}
              </NavLink>
            ) : (
              <div key={i} className="flex justify-center">
                <button onClick={() => openAdd()} className="-mt-6 grid size-15 place-items-center rounded-full bg-leaf-600 text-white shadow-[var(--shadow-lift)] ring-4 ring-surface" aria-label={t("nav.addExpense")}>
                  <Plus className="size-7" />
                </button>
              </div>
            ),
          )}
        </div>
      </nav>

      <AddTransactionSheet open={sheet.open} type={sheet.type} onClose={() => setSheet((s) => ({ ...s, open: false }))} />
    </QuickAddCtx.Provider>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <Logo size={32} />
        <LanguageSwitch compact />
      </header>
      <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10">
        {children}
      </main>
    </div>
  );
}
