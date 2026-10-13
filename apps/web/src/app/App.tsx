import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSession } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { AppShell } from "@/components/layout/AppShell";
import { LogoMark } from "@/components/brand";
import { WelcomePage, LanguagePage, LoginPage, RegisterPage } from "@/features/auth/AuthPages";
import { OnboardingPage } from "@/features/auth/OnboardingPage";

const HomePage = lazy(() => import("@/features/home/HomePage").then((m) => ({ default: m.HomePage })));
const MoneyPage = lazy(() => import("@/features/money/MoneyPage").then((m) => ({ default: m.MoneyPage })));
const GoalsPage = lazy(() => import("@/features/goals/GoalsPage").then((m) => ({ default: m.GoalsPage })));
const EmergencyFundPage = lazy(() => import("@/features/goals/GoalsPage").then((m) => ({ default: m.EmergencyFundPage })));
const HealthPage = lazy(() => import("@/features/goals/HealthPage").then((m) => ({ default: m.HealthPage })));
const LearnPage = lazy(() => import("@/features/learn/LearnPages").then((m) => ({ default: m.LearnPage })));
const CoursePage = lazy(() => import("@/features/learn/LearnPages").then((m) => ({ default: m.CoursePage })));
const LessonPage = lazy(() => import("@/features/learn/LessonPage").then((m) => ({ default: m.LessonPage })));
const AchievementsPage = lazy(() => import("@/features/learn/AchievementsPage").then((m) => ({ default: m.AchievementsPage })));
const ToolsPage = lazy(() => import("@/features/tools/ToolsPages").then((m) => ({ default: m.ToolsPage })));
const CalculatorPage = lazy(() => import("@/features/tools/ToolsPages").then((m) => ({ default: m.CalculatorPage })));
const ScamShieldPage = lazy(() => import("@/features/scam/ScamShieldPage").then((m) => ({ default: m.ScamShieldPage })));
const AskPage = lazy(() => import("@/features/ai/AskPage").then((m) => ({ default: m.AskPage })));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePages").then((m) => ({ default: m.ProfilePage })));
const PrivacyPage = lazy(() => import("@/features/profile/ProfilePages").then((m) => ({ default: m.PrivacyPage })));
const SecurityPage = lazy(() => import("@/features/profile/ProfilePages").then((m) => ({ default: m.SecurityPage })));
const NotificationsPage = lazy(() => import("@/features/profile/ProfilePages").then((m) => ({ default: m.NotificationsPage })));
const AdminLayout = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminDashboard })));
const AdminContent = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminContent })));
const AdminLessonEditor = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminLessonEditor })));
const AdminUsers = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminUsers })));
const AdminAudit = lazy(() => import("@/features/admin/AdminPages").then((m) => ({ default: m.AdminAudit })));

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-600">
      <div className="flex flex-col items-center gap-4 text-white">
        <LogoMark size={72} inverted />
        <span className="text-3xl font-bold" style={{ fontFamily: "Yaldevi, var(--font-sans)" }}>
          සකසුරු
        </span>
      </div>
    </div>
  );
}

function NotFound() {
  const { t } = useI18n();
  return <p className="py-20 text-center text-muted">{t("common.notFound")}</p>;
}

function Guarded() {
  const { me, ready } = useSession();
  const loc = useLocation();
  if (!ready) return <Splash />;
  if (!me) {
    return (
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/welcome" replace state={{ from: loc.pathname }} />} />
      </Routes>
    );
  }
  if (!me.profile.onboardingCompleted && loc.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="money" element={<MoneyPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="goals/emergency" element={<EmergencyFundPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="learn/:slug" element={<CoursePage />} />
        <Route path="learn/lesson/:slug" element={<LessonPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="tools/:id" element={<CalculatorPage />} />
        <Route path="scam-shield" element={<ScamShieldPage />} />
        <Route path="ask" element={<AskPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/privacy" element={<PrivacyPage />} />
        <Route path="profile/security" element={<SecurityPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="content/:slug" element={<AdminLessonEditor />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>
        <Route path="welcome" element={<Navigate to="/" replace />} />
        <Route path="login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="mx-auto mt-24 size-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" aria-hidden />}>
        <Guarded />
      </Suspense>
    </HashRouter>
  );
}
