import type { Api } from "./api";
import { ApiError } from "./api";

/**
 * HTTP client for the සකසුරු API.
 * The access token lives only in memory; the refresh token is an httpOnly cookie,
 * rotated on every refresh (X-Requested-With guards against CSRF).
 */
export function createRemoteApi(baseUrl: string): Api {
  // "/" means the API serves this web app (same origin).
  const root = (baseUrl === "/" ? "" : baseUrl.replace(/\/$/, "")) + "/api/v1";
  let accessToken: string | null = null;
  let refreshing: Promise<boolean> | null = null;

  async function refresh(): Promise<boolean> {
    refreshing ??= (async () => {
      try {
        const res = await fetch(`${root}/auth/refresh`, { method: "POST", credentials: "include", headers: { "x-requested-with": "sakasuru" } });
        if (!res.ok) return false;
        accessToken = (await res.json()).accessToken;
        return true;
      } catch {
        return false;
      } finally {
        setTimeout(() => (refreshing = null), 0);
      }
    })();
    return refreshing;
  }

  async function req<T>(method: string, path: string, body?: unknown, retry = true): Promise<T> {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["content-type"] = "application/json";
    if (accessToken) headers.authorization = `Bearer ${accessToken}`;
    let res: Response;
    try {
      res = await fetch(`${root}${path}`, { method, headers, credentials: "include", body: body === undefined ? undefined : JSON.stringify(body) });
    } catch {
      throw new ApiError(0, "network", "network");
    }
    if (res.status === 401 && retry && !path.startsWith("/auth/login") && !path.startsWith("/auth/register")) {
      if (await refresh()) return req<T>(method, path, body, false);
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(res.status, data.error ?? "error", data.message ?? res.statusText);
    }
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  const get = <T>(p: string) => req<T>("GET", p);
  const post = <T>(p: string, b?: unknown) => req<T>("POST", p, b ?? {});
  const patch = <T>(p: string, b: unknown) => req<T>("PATCH", p, b);
  const put = <T>(p: string, b: unknown) => req<T>("PUT", p, b);
  const del = <T>(p: string, b?: unknown) => req<T>("DELETE", p, b);

  return {
    mode: "remote",
    async register(input) {
      const r = await req<{ accessToken: string; me: never }>("POST", "/auth/register", input);
      accessToken = r.accessToken;
      return { me: r.me };
    },
    async login(email, password) {
      const r = await req<{ accessToken: string; me: never }>("POST", "/auth/login", { email, password });
      accessToken = r.accessToken;
      return { me: r.me };
    },
    async logout() {
      await post("/auth/logout").catch(() => undefined);
      accessToken = null;
    },
    async restore() {
      if (!(await refresh())) return null;
      return get("/auth/me");
    },
    changePassword: (currentPassword, newPassword) => post("/auth/change-password", { currentPassword, newPassword }),
    sessions: () => get("/auth/sessions"),
    revokeSession: (id) => del(`/auth/sessions/${id}`),

    updateProfile: (p) => patch("/me/profile", p),
    updatePreferences: (p) => patch("/me/preferences", p),
    updateConsents: (c) => patch("/me/consents", c),
    exportData: () => get("/me/export"),
    deleteAccount: async () => {
      await del("/me", { confirm: "DELETE" });
      accessToken = null;
    },

    dashboard: () => get("/dashboard"),
    healthHistory: () => get("/health-score/history"),
    transactions: (q) => get(`/transactions?${new URLSearchParams(Object.entries(q ?? {}).filter(([, v]) => v) as [string, string][]).toString()}`),
    addTransaction: (t) => post("/transactions", t),
    updateTransaction: (id, t) => patch(`/transactions/${id}`, t),
    deleteTransaction: (id) => del(`/transactions/${id}`),
    importTransactions: async (rows) => (await post<{ imported: number }>("/transactions/import", { rows })).imported,
    recurring: () => get("/recurring"),
    addRecurring: (r) => post("/recurring", r),
    updateRecurring: (id, r) => patch(`/recurring/${id}`, r),
    deleteRecurring: (id) => del(`/recurring/${id}`),
    budget: (m) => get(`/budgets/${m}`),
    saveBudget: (m, b) => put(`/budgets/${m}`, b),
    goals: () => get("/goals"),
    addGoal: (g) => post("/goals", g),
    updateGoal: (id, g) => patch(`/goals/${id}`, g),
    deleteGoal: (id) => del(`/goals/${id}`),
    contribute: (id, amount) => post(`/goals/${id}/contributions`, { amount }),
    debts: () => get("/debts"),
    addDebt: (d) => post("/debts", d),
    updateDebt: (id, d) => patch(`/debts/${id}`, d),
    deleteDebt: (id) => del(`/debts/${id}`),
    simulateDebts: (extra) => get(`/debts/simulate?extra=${extra}`),
    monthlyReport: (m) => get(`/reports/monthly${m ? `?month=${m}` : ""}`),

    courses: () => get("/courses"),
    lesson: (slug) => get(`/lessons/${slug}`),
    learning: () => get("/learning"),
    completeLesson: (slug, answers) => post(`/lessons/${slug}/complete`, { answers }),
    joinChallenge: (key) => post(`/challenges/${key}/join`),
    completeChallenge: (key) => post(`/challenges/${key}/complete`),

    notifications: () => get("/notifications"),
    readNotification: (id) => post(`/notifications/${id}/read`),
    readAllNotifications: () => post("/notifications/read-all"),

    checkScam: (text) => post("/scam/check", { text }),
    ask: (input) => post("/ai/ask", input),
    clearAiHistory: () => del("/ai/history"),

    adminStats: () => get("/admin/stats"),
    adminUsers: (q) => get(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    adminSetRole: (id, role) => patch(`/admin/users/${id}/role`, { role }),
    adminLessons: () => get("/admin/lessons"),
    adminLesson: (slug) => get(`/admin/lessons/${slug}`),
    adminSaveLesson: (l) => put(`/admin/lessons/${l.slug}`, l),
    adminSetLessonStatus: (slug, status) => post(`/admin/lessons/${slug}/status`, { status }),
    adminAuditLogs: () => get("/admin/audit-logs"),
  };
}
