import type { Api, AdminUser, MonthlyReport, DebtSimulation } from "./api";
import { ApiError } from "./api";
import type {
  MeDTO,
  ProfileDTO,
  Preferences,
  Consents,
  TransactionDTO,
  RecurringDTO,
  BudgetDTO,
  GoalDTO,
  DebtDTO,
  LearningStateDTO,
  NotificationDTO,
  CourseSummaryDTO,
  LessonDTO,
  AdminLessonDTO,
  AuditLogDTO,
  ContentStatus,
  LessonUpsert,
  RoleName,
} from "@sakasuru/validation";
import { TransactionSchema, GoalSchema, DebtSchema, RecurringSchema, BudgetSchema, ProfileUpdateSchema, RegisterSchema } from "@sakasuru/validation";
import {
  computeDashboard,
  enrichGoal,
  enrichDebt,
  enrichRecurring,
  monthKeyOf,
  suggestNeedWant,
  checkScamMessage,
  simulateDebtStrategy,
  simulateExtraPayment,
  getCategory,
  D,
  toPercent,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@sakasuru/financial-engine";
import {
  COURSES,
  KNOWLEDGE,
  searchKnowledge,
  gradeQuiz,
  updateStreak,
  xpForAttempt,
  colomboDate,
  evaluateBadges,
  badgeXp,
  levelForXp,
  CHALLENGES,
  type Lesson,
} from "@sakasuru/content";
import { translate, formatMoney, dictionaries, type Lang } from "@sakasuru/localization";

/* --------------------------------------------------------------------------
 * On-device store used for the hosted demo and when no API is configured.
 * It runs the same domain services (financial-engine, content) as the API,
 * so numbers and rules match. Data never leaves the browser.
 * ------------------------------------------------------------------------ */

const KEY = "sakasuru:local:v1";

interface Account {
  id: string;
  email: string;
  pwHash: string;
  salt: string;
  role: RoleName;
  createdAt: string;
}

interface GoalRec {
  id: string;
  name: string;
  type: string;
  target: number;
  saved: number;
  deadline: string | null;
  status: GoalDTO["status"];
  createdAt: string;
  contributions: { amount: number; at: string }[];
}

interface UserData {
  profile: ProfileDTO;
  preferences: Preferences;
  consents: Consents;
  consentLog: { type: string; granted: boolean; at: string }[];
  transactions: TransactionDTO[];
  recurring: Omit<RecurringDTO, "nextDue">[];
  budgets: Record<string, BudgetDTO>;
  goals: GoalRec[];
  debts: Omit<DebtDTO, "payoffMonths" | "totalInterest">[];
  healthScores: Record<string, number>;
  learning: {
    xp: number;
    streak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    completed: LearningStateDTO["completed"];
    attempts: { slug: string; score: number; total: number; at: string }[];
    badges: { key: string; earnedAt: string }[];
    challenges: { key: string; joinedAt: string; completedAt: string | null }[];
  };
  notifications: (NotificationDTO & { dedupeKey: string })[];
  aiTopics: Record<string, number>;
}

interface LessonOverride {
  courseSlug: string;
  lesson: Lesson;
  status: ContentStatus;
  author: string | null;
  reviewer: string | null;
  updatedAt: string;
}

interface Store {
  accounts: Account[];
  sessionUserId: string | null;
  users: Record<string, UserData>;
  lessonOverrides: Record<string, LessonOverride>;
  audit: AuditLogDTO[];
}

const empty = (): Store => ({ accounts: [], sessionUserId: null, users: {}, lessonOverrides: {}, audit: [] });

let memory: Store | null = null;
function load(): Store {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    memory = raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    memory = empty();
  }
  return memory!;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* storage unavailable (private mode): keep the data in memory for this visit */
  }
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
const nowIso = () => new Date().toISOString();
const isoDay = (d: Date) => `${monthKeyOf(d)}-${String(d.getDate()).padStart(2, "0")}`;
const delay = <T>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 60));

async function hashPassword(password: string, salt: string) {
  if (!crypto?.subtle) throw new ApiError(500, "crypto_unavailable", "Secure crypto is not available in this browser.");
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 210_000 }, keyMaterial, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

const DEFAULT_PREFS: Preferences = { dataSaver: false, reducedMotion: false, highContrast: false, textScale: 1, notifyBills: true, notifyBudget: true, notifyGoals: true, notifyLearning: true };

function newUserData(name: string, language: Lang): UserData {
  return {
    profile: { name, language, ageRange: null, employment: null, helpWith: [], incomeRange: null, monthlyIncome: null, monthlyExpenses: null, currentSavings: null, monthlyDebt: null, primaryGoal: null, mode: "standard", onboardingCompleted: false },
    preferences: { ...DEFAULT_PREFS },
    consents: { aiDataAccess: false, aiHistory: false, analytics: false },
    consentLog: [{ type: "terms", granted: true, at: nowIso() }],
    transactions: [],
    recurring: [],
    budgets: {},
    goals: [],
    debts: [],
    healthScores: {},
    learning: { xp: 0, streak: 0, longestStreak: 0, lastActiveDate: null, completed: {}, attempts: [], badges: [], challenges: [] },
    notifications: [{ id: uid(), key: "notifications.welcome", params: {}, read: false, createdAt: nowIso(), dedupeKey: "welcome" }],
    aiTopics: {},
  };
}

/** Realistic sample month for the demo persona "Kasun", a Colombo office worker. */
function seedDemo(u: UserData) {
  const today = new Date();
  const tx = (monthsAgo: number, day: number, type: "expense" | "income", amount: number, categoryKey: string, merchant: string | null, method: string | null = "cash") => {
    const d = new Date(today.getFullYear(), today.getMonth() - monthsAgo, Math.min(day, 28));
    if (monthsAgo === 0 && d > today) return;
    u.transactions.push({ id: uid(), type, amount, categoryKey, date: isoDay(d), merchant, method, notes: null, needWant: type === "expense" ? suggestNeedWant(categoryKey) : null, recurringId: null, createdAt: d.toISOString() });
  };
  for (const m of [2, 1, 0]) {
    tx(m, 1, "income", 85000, "salary", "Office", "bankTransfer");
    tx(m, 2, "expense", 22000, "rent", "Landlord — Dehiwala", "bankTransfer");
    tx(m, 3, "expense", 9800 - m * 400, "groceries", "Keells", "debitCard");
    tx(m, 5, "expense", 4200, "electricity", "CEB", "lankaqr");
    tx(m, 6, "expense", 2990, "internet", "Fibre", "bankTransfer");
    tx(m, 7, "expense", 1500, "mobileReload", "Reload", "mobileWallet");
    tx(m, 8, "expense", 3600 + m * 1800, "bus", "Bus & train pass", "cash");
    tx(m, 10, "expense", 2400, "eatingOut", "Lunch with team", "cash");
    tx(m, 12, "expense", 4600, "foodDelivery", "Food delivery", "creditCard");
    tx(m, 14, "expense", 6000, "familyContribution", "Amma", "bankTransfer");
    tx(m, 15, "expense", 10000, "loanInstalment", "Personal loan", "bankTransfer");
    tx(m, 17, "expense", 1990, "subscriptions", "Streaming", "creditCard");
    tx(m, 19, "expense", 7400, "groceries", "Pola & Arpico", "cash");
    tx(m, 22, "expense", 3500, "entertainment", "Cinema & cricket", "lankaqr");
    tx(m, 25, "expense", 1800, "threeWheeler", "Tuk", "cash");
  }
  const month = monthKeyOf(today);
  u.budgets[month] = {
    month,
    income: 85000,
    items: [
      { categoryKey: "rent", planned: 22000 },
      { categoryKey: "groceries", planned: 18000 },
      { categoryKey: "electricity", planned: 4500 },
      { categoryKey: "internet", planned: 3000 },
      { categoryKey: "bus", planned: 5000 },
      { categoryKey: "eatingOut", planned: 3000 },
      { categoryKey: "foodDelivery", planned: 3000 },
      { categoryKey: "loanInstalment", planned: 10000 },
      { categoryKey: "entertainment", planned: 4000 },
      { categoryKey: "familyContribution", planned: 6000 },
    ],
  };
  const created = new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString();
  u.goals.push(
    { id: uid(), name: "Emergency fund", type: "emergency", target: 180000, saved: 82500, deadline: isoDay(new Date(today.getFullYear() + 1, 5, 30)), status: "active", createdAt: created, contributions: [{ amount: 7500, at: new Date(today.getFullYear(), today.getMonth(), Math.min(2, today.getDate())).toISOString() }] },
    { id: uid(), name: "New laptop", type: "laptop", target: 250000, saved: 75000, deadline: `${today.getFullYear() + 1}-12-01`, status: "active", createdAt: created, contributions: [] },
  );
  u.debts.push({ id: uid(), type: "personal", lender: "Bank personal loan", balance: 186000, ratePercent: 16.5, monthlyPayment: 10000, remainingMonths: 22, dueDay: 15 });
  u.recurring.push(
    { id: uid(), name: "Rent", amount: 22000, categoryKey: "rent", dayOfMonth: 2, active: true },
    { id: uid(), name: "Electricity (CEB)", amount: 4200, categoryKey: "electricity", dayOfMonth: Math.min(today.getDate() + 2, 28), active: true },
    { id: uid(), name: "Fibre internet", amount: 2990, categoryKey: "internet", dayOfMonth: 6, active: true },
    { id: uid(), name: "Loan instalment", amount: 10000, categoryKey: "loanInstalment", dayOfMonth: 15, active: true },
  );
  const yesterday = colomboDate(new Date(Date.now() - 86_400_000));
  u.learning = {
    xp: 160,
    streak: 3,
    longestStreak: 5,
    lastActiveDate: yesterday,
    completed: {
      "why-save": { score: 3, total: 3, completedAt: new Date(Date.now() - 3 * 86_400_000).toISOString() },
      "income-vs-expenses": { score: 2, total: 3, completedAt: new Date(Date.now() - 2 * 86_400_000).toISOString() },
      "otp-pin-safety": { score: 3, total: 3, completedAt: new Date(Date.now() - 86_400_000).toISOString() },
    },
    attempts: [],
    badges: [
      { key: "firstExpense", earnedAt: created },
      { key: "firstBudget", earnedAt: created },
      { key: "quizAce", earnedAt: new Date(Date.now() - 3 * 86_400_000).toISOString() },
      { key: "emergencyStarter", earnedAt: created },
    ],
    challenges: [{ key: "track7", joinedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(), completedAt: null }],
  };
  const prev = monthKeyOf(new Date(today.getFullYear(), today.getMonth() - 1, 1));
  u.healthScores[prev] = 64;
  u.profile = { ...u.profile, ageRange: "a25", employment: "salaried", helpWith: ["saveMore", "emergencyFund"], incomeRange: "r60to100", monthlyIncome: 85000, primaryGoal: "emergency", onboardingCompleted: true };
  u.consents = { aiDataAccess: true, aiHistory: false, analytics: false };
}

export function createLocalApi(): Api {
  const s = () => load();
  const me = (): { acc: Account; u: UserData } => {
    const st = s();
    const acc = st.accounts.find((a) => a.id === st.sessionUserId);
    if (!acc || !st.users[acc.id]) throw new ApiError(401, "unauthorized", "Please sign in");
    return { acc, u: st.users[acc.id]! };
  };
  const audit = (action: string, target: string | null = null) => {
    const st = s();
    const actor = st.accounts.find((a) => a.id === st.sessionUserId)?.email ?? null;
    st.audit.unshift({ id: uid(), actor, action, target, createdAt: nowIso(), ip: "on-device" });
    st.audit = st.audit.slice(0, 200);
  };
  const toMe = (acc: Account, u: UserData): MeDTO => ({ user: { id: acc.id, email: acc.email, role: acc.role, createdAt: acc.createdAt }, profile: u.profile, preferences: u.preferences, consents: u.consents });
  const assertRole = (min: RoleName) => {
    const rank: Record<RoleName, number> = { user: 0, creator: 1, reviewer: 2, moderator: 3, admin: 4, superadmin: 5 };
    if (rank[me().acc.role] < rank[min]) throw new ApiError(403, "forbidden", "Forbidden");
  };

  /* --------------------------- content (with CMS overrides) --------------------------- */
  const lessonRows = () => {
    const st = s();
    const rows: { courseSlug: string; lesson: Lesson; status: ContentStatus; author: string | null; reviewer: string | null; updatedAt: string }[] = [];
    for (const c of COURSES)
      for (const l of c.lessons) {
        const o = st.lessonOverrides[l.slug];
        rows.push(o ?? { courseSlug: c.slug, lesson: l, status: "published", author: "සකසුරු education team", reviewer: "සකසුරු education team", updatedAt: l.lastReviewed });
      }
    for (const [slug, o] of Object.entries(st.lessonOverrides)) if (!rows.some((r) => r.lesson.slug === slug)) rows.push(o);
    return rows;
  };
  const courses = (includeUnpublished = false): CourseSummaryDTO[] => {
    const rows = lessonRows();
    return COURSES.map((c) => ({
      slug: c.slug,
      level: c.level,
      icon: c.icon,
      color: c.color,
      title: c.title,
      description: c.description,
      prerequisites: c.prerequisites ?? [],
      lessons: rows
        .filter((r) => r.courseSlug === c.slug && (includeUnpublished || r.status === "published"))
        .map(({ lesson: l }) => ({ slug: l.slug, title: l.title, summary: l.summary, minutes: l.minutes, xp: l.xp, protection: !!l.protection, timeSensitive: !!l.timeSensitive })),
    }));
  };
  const findLessonRow = (slug: string) => lessonRows().find((r) => r.lesson.slug === slug);

  /* --------------------------- derived state --------------------------- */
  const goalsForDashboard = (u: UserData, month: string) =>
    u.goals.map((g) => ({ ...g, contributedThisMonth: g.contributions.filter((c) => monthKeyOf(new Date(c.at)) === month).reduce((a, c) => a + c.amount, 0) }));

  const dashboardFor = (u: UserData) => {
    const today = new Date();
    const month = monthKeyOf(today);
    const done = Object.keys(u.learning.completed);
    const protection = new Set(courses().flatMap((c) => c.lessons.filter((l) => l.protection).map((l) => l.slug)));
    const prevMonths = Object.keys(u.healthScores).filter((m) => m < month).sort();
    const d = computeDashboard({
      today,
      transactions: u.transactions,
      budget: u.budgets[month] ?? null,
      goals: goalsForDashboard(u, month),
      debts: u.debts,
      recurring: u.recurring,
      profile: u.profile,
      lessonsCompleted: done.length,
      protectionLessonsCompleted: done.filter((x) => protection.has(x)).length,
      previousScore: prevMonths.length ? u.healthScores[prevMonths.at(-1)!]! : null,
    });
    u.healthScores[month] = d.health.score;
    const byId = new Map(u.transactions.map((t) => [t.id, t]));
    return { ...d, recent: d.recent.map((r) => byId.get(r.id)!) };
  };

  const learningState = (u: UserData): LearningStateDTO => {
    const L = u.learning;
    const today = colomboDate();
    const yesterday = colomboDate(new Date(Date.now() - 86_400_000));
    const lvl = levelForXp(L.xp);
    return {
      xp: L.xp,
      level: lvl.level,
      currentLevelXp: lvl.currentLevelXp,
      nextLevelXp: lvl.nextLevelXp,
      streak: L.lastActiveDate === today || L.lastActiveDate === yesterday ? L.streak : 0,
      longestStreak: L.longestStreak,
      lastActiveDate: L.lastActiveDate,
      completed: L.completed,
      badges: L.badges,
      challenges: L.challenges.map((c) => {
        const def = CHALLENGES.find((d) => d.key === c.key);
        const since = new Date(c.joinedAt);
        const sinceIso = colomboDate(since);
        const exp = u.transactions.filter((t) => t.type === "expense" && t.date >= sinceIso);
        const days = new Set(exp.map((t) => t.date));
        const wantDays = new Set(exp.filter((t) => t.needWant === "want").map((t) => t.date));
        const contributions = u.goals.flatMap((g) => g.contributions.filter((x) => new Date(x.at) >= since && x.amount > 0).map((x) => ({ ...x, type: g.type })));
        const metrics = {
          expenseDays: days.size,
          lessons: L.attempts.filter((a) => new Date(a.at) >= since).length,
          savedAmount: contributions.reduce((a, x) => a + x.amount, 0),
          noSpendDays: [...days].filter((d) => !wantDays.has(d) && d < today).length,
          subscriptionReview: 0,
          emergencyContribution: contributions.filter((x) => x.type === "emergency").length,
        };
        const progress = def ? Math.min(metrics[def.metric], def.target) : 0;
        return { key: c.key, joinedAt: c.joinedAt, progress, completed: !!c.completedAt || (def ? progress >= def.target : false) };
      }),
    };
  };

  const award = (u: UserData, perfectQuiz = false) => {
    const months = new Map<string, { i: number; e: number }>();
    for (const t of u.transactions) {
      const m = t.date.slice(0, 7);
      const cur = months.get(m) ?? { i: 0, e: 0 };
      if (t.type === "income") cur.i += t.amount;
      else if (t.categoryKey !== "savings" && t.categoryKey !== "investments") cur.e += t.amount;
      months.set(m, cur);
    }
    const bestRate = Math.max(0, ...[...months.values()].filter((v) => v.i > 0).map((v) => ((v.i - v.e) / v.i) * 100));
    const cs = courses();
    const last = monthKeyOf(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
    const lb = u.budgets[last];
    const spentLast = (k: string) => u.transactions.filter((t) => t.type === "expense" && t.categoryKey === k && t.date.startsWith(last)).reduce((a, t) => a + t.amount, 0);
    const keys = evaluateBadges(
      {
        expenseCount: u.transactions.filter((t) => t.type === "expense").length,
        budgetCount: Object.keys(u.budgets).length,
        bestMonthSavingRate: bestRate,
        lessonsCompleted: Object.keys(u.learning.completed),
        protectionLessons: cs.flatMap((c) => c.lessons.filter((l) => l.protection).map((l) => l.slug)),
        investingLessons: cs.find((c) => c.slug === "saving-investing")?.lessons.map((l) => l.slug) ?? [],
        streak: u.learning.streak,
        budgetAllWithinLastMonth: !!lb && lb.items.length > 0 && lb.items.every((i) => spentLast(i.categoryKey) <= i.planned),
        emergencyContributed: u.goals.some((g) => g.type === "emergency" && g.contributions.some((c) => c.amount > 0)),
        perfectQuiz,
      },
      u.learning.badges.map((b) => b.key),
    );
    for (const k of keys) {
      u.learning.badges.push({ key: k, earnedAt: nowIso() });
      u.learning.xp += badgeXp(k);
      u.notifications.unshift({ id: uid(), key: "notifications.badge", params: { badge: k }, read: false, createdAt: nowIso(), dedupeKey: `badge:${k}` });
    }
    return keys;
  };

  const notify = (u: UserData, key: string, params: Record<string, string | number>, dedupeKey: string) => {
    if (u.notifications.some((n) => n.dedupeKey === dedupeKey)) return;
    u.notifications.unshift({ id: uid(), key, params, read: false, createdAt: nowIso(), dedupeKey });
  };

  const goalDto = (g: GoalRec): GoalDTO => enrichGoal(g, new Date());
  const debtDto = (d: UserData["debts"][number]): DebtDTO => enrichDebt(d);
  const recurringList = (u: UserData): RecurringDTO[] => u.recurring.map((r) => {
    const { daysUntil: _d, ...rest } = enrichRecurring(r, new Date());
    return rest;
  });
  const parse = <T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, v: unknown): T => {
    const r = schema.safeParse(v);
    if (!r.success) throw new ApiError(400, "validation_failed", "Some fields are invalid.");
    return r.data as T;
  };

  async function signIn(acc: Account) {
    const st = s();
    st.sessionUserId = acc.id;
    audit("auth.login", acc.id);
    save();
    return { me: toMe(acc, st.users[acc.id]!) };
  }

  return {
    mode: "local",

    async register(input) {
      const v = parse(RegisterSchema, input) as typeof input;
      const st = s();
      if (st.accounts.some((a) => a.email === v.email)) throw new ApiError(409, "email_taken", "Email taken");
      const salt = uid();
      const acc: Account = { id: uid(), email: v.email, pwHash: await hashPassword(v.password, salt), salt, role: "user", createdAt: nowIso() };
      st.accounts.push(acc);
      st.users[acc.id] = newUserData(v.name, v.language);
      audit("auth.register", acc.id);
      return signIn(acc);
    },
    async login(email, password) {
      const acc = s().accounts.find((a) => a.email === email.trim().toLowerCase());
      if (!acc || (await hashPassword(password, acc.salt)) !== acc.pwHash) throw new ApiError(401, "invalid_credentials", "Invalid");
      return signIn(acc);
    },
    async startDemo() {
      const st = s();
      let acc = st.accounts.find((a) => a.email === "kasun@demo.sakasuru.lk");
      if (!acc) {
        const salt = uid();
        acc = { id: uid(), email: "kasun@demo.sakasuru.lk", pwHash: await hashPassword("demo-account-password", salt), salt, role: "admin", createdAt: nowIso() };
        st.accounts.push(acc);
        const u = newUserData("Kasun", "si");
        seedDemo(u);
        st.users[acc.id] = u;
      }
      return signIn(acc);
    },
    async logout() {
      s().sessionUserId = null;
      save();
    },
    async restore() {
      const st = s();
      const acc = st.accounts.find((a) => a.id === st.sessionUserId);
      return acc && st.users[acc.id] ? toMe(acc, st.users[acc.id]!) : null;
    },
    async changePassword(current, next) {
      const { acc } = me();
      if ((await hashPassword(current, acc.salt)) !== acc.pwHash) throw new ApiError(401, "invalid_credentials", "Invalid");
      if (next.length < 10) throw new ApiError(400, "validation_failed", "Too short");
      acc.salt = uid();
      acc.pwHash = await hashPassword(next, acc.salt);
      audit("auth.password_changed", acc.id);
      save();
    },
    sessions: async () => [{ id: "this-device", userAgent: navigator.userAgent, createdAt: me().acc.createdAt, lastUsedAt: nowIso(), current: true }],
    revokeSession: async () => undefined,

    async updateProfile(p) {
      const v = parse(ProfileUpdateSchema, p) as typeof p;
      const { u } = me();
      u.profile = { ...u.profile, ...v } as ProfileDTO;
      save();
      return delay(u.profile);
    },
    async updatePreferences(p) {
      const { u } = me();
      u.preferences = { ...u.preferences, ...p };
      save();
      return u.preferences;
    },
    async updateConsents(c) {
      const { u } = me();
      u.consents = { ...u.consents, ...c };
      for (const [type, granted] of Object.entries(c)) u.consentLog.push({ type, granted: !!granted, at: nowIso() });
      audit("consent.updated");
      save();
      return u.consents;
    },
    async exportData() {
      const { acc, u } = me();
      audit("data.exported", acc.id);
      save();
      return { exportedAt: nowIso(), account: toMe(acc, u), ...u };
    },
    async deleteAccount() {
      const st = s();
      const { acc } = me();
      delete st.users[acc.id];
      st.accounts = st.accounts.filter((a) => a.id !== acc.id);
      st.sessionUserId = null;
      audit("account.deleted");
      save();
    },

    async dashboard() {
      const { u } = me();
      const d = dashboardFor(u);
      save();
      return delay(d);
    },
    async healthHistory() {
      const { u } = me();
      dashboardFor(u);
      return Object.entries(u.healthScores)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, score]) => ({ month, score }));
    },
    async transactions(q) {
      const { u } = me();
      return delay(
        u.transactions
          .filter((t) => (!q?.from || t.date >= q.from) && (!q?.to || t.date <= q.to))
          .sort((a, b) => (b.date === a.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date))),
      );
    },
    async addTransaction(t) {
      const v = parse(TransactionSchema, t) as typeof t;
      const { u } = me();
      let recurringId: string | null = null;
      if (v.recurring && v.type === "expense") {
        recurringId = uid();
        u.recurring.push({ id: recurringId, name: v.merchant || translate(u.profile.language, `categories.${v.categoryKey}`), amount: v.amount, categoryKey: v.categoryKey, dayOfMonth: Number(v.date.slice(8, 10)), active: true });
      }
      const row: TransactionDTO = {
        id: uid(),
        type: v.type,
        amount: D(v.amount).toDecimalPlaces(2).toNumber(),
        categoryKey: v.categoryKey,
        date: v.date,
        merchant: v.merchant ?? null,
        method: v.method ?? null,
        notes: v.notes ?? null,
        needWant: v.type === "expense" ? (v.needWant ?? suggestNeedWant(v.categoryKey)) : null,
        recurringId,
        createdAt: nowIso(),
      };
      u.transactions.push(row);
      award(u);
      save();
      return row;
    },
    async updateTransaction(id, t) {
      const { u } = me();
      const row = u.transactions.find((x) => x.id === id);
      if (!row) throw new ApiError(404, "not_found", "Not found");
      Object.assign(row, Object.fromEntries(Object.entries(t).filter(([k, v]) => v !== undefined && k !== "recurring")));
      save();
      return row;
    },
    async deleteTransaction(id) {
      const { u } = me();
      u.transactions = u.transactions.filter((x) => x.id !== id);
      save();
    },
    async importTransactions(rows) {
      const { u } = me();
      const exp = new Set<string>(EXPENSE_CATEGORIES.map((c) => c.key));
      const inc = new Set<string>(INCOME_CATEGORIES.map((c) => c.key));
      let n = 0;
      for (const r of rows) {
        if (!r.amount || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) continue;
        const isInc = !!r.categoryKey && inc.has(r.categoryKey);
        const isExp = !!r.categoryKey && exp.has(r.categoryKey);
        const type = isInc ? "income" : r.amount < 0 || isExp ? "expense" : "income";
        const categoryKey = type === "income" ? (isInc ? r.categoryKey! : "otherIncome") : isExp ? r.categoryKey! : "other";
        u.transactions.push({ id: uid(), type, amount: Math.abs(r.amount), categoryKey, date: r.date, merchant: r.description ?? null, method: null, notes: null, needWant: type === "expense" ? suggestNeedWant(categoryKey) : null, recurringId: null, createdAt: nowIso() });
        n++;
      }
      save();
      return n;
    },
    async recurring() {
      return recurringList(me().u);
    },
    async addRecurring(r) {
      const v = parse(RecurringSchema, r) as typeof r;
      const { u } = me();
      u.recurring.push({ id: uid(), name: v.name, amount: v.amount, categoryKey: v.categoryKey, dayOfMonth: v.dayOfMonth, active: v.active ?? true });
      save();
      return recurringList(u);
    },
    async updateRecurring(id, r) {
      const { u } = me();
      const row = u.recurring.find((x) => x.id === id);
      if (row) Object.assign(row, r);
      save();
      return recurringList(u);
    },
    async deleteRecurring(id) {
      const { u } = me();
      u.recurring = u.recurring.filter((x) => x.id !== id);
      save();
    },
    async budget(month) {
      return me().u.budgets[month] ?? null;
    },
    async saveBudget(month, b) {
      const v = parse(BudgetSchema, b) as typeof b;
      const { u } = me();
      u.budgets[month] = { month, income: v.income, items: v.items.filter((i) => i.planned > 0) };
      award(u);
      save();
      return u.budgets[month]!;
    },
    async goals() {
      return me().u.goals.map(goalDto);
    },
    async addGoal(g) {
      const v = parse(GoalSchema, g) as Required<typeof g>;
      const { u } = me();
      const row: GoalRec = { id: uid(), name: v.name, type: v.type, target: v.target, saved: v.saved ?? 0, deadline: v.deadline ?? null, status: (v.saved ?? 0) >= v.target ? "completed" : (v.status ?? "active"), createdAt: nowIso(), contributions: [] };
      u.goals.push(row);
      save();
      return goalDto(row);
    },
    async updateGoal(id, g) {
      const { u } = me();
      const row = u.goals.find((x) => x.id === id);
      if (!row) throw new ApiError(404, "not_found", "Not found");
      Object.assign(row, Object.fromEntries(Object.entries(g).filter(([, v]) => v !== undefined)));
      save();
      return goalDto(row);
    },
    async deleteGoal(id) {
      const { u } = me();
      u.goals = u.goals.filter((x) => x.id !== id);
      save();
    },
    async contribute(id, amount) {
      const { u } = me();
      const row = u.goals.find((x) => x.id === id);
      if (!row) throw new ApiError(404, "not_found", "Not found");
      row.saved = Math.max(0, D(row.saved).plus(amount).toNumber());
      row.contributions.push({ amount, at: nowIso() });
      if (row.saved >= row.target) row.status = "completed";
      else if (row.status === "completed") row.status = "active";
      award(u);
      save();
      return goalDto(row);
    },
    async debts() {
      return me().u.debts.map(debtDto);
    },
    async addDebt(d) {
      const v = parse(DebtSchema, d) as typeof d;
      const { u } = me();
      const row = { id: uid(), type: v.type, lender: v.lender ?? null, balance: v.balance, ratePercent: v.ratePercent, monthlyPayment: v.monthlyPayment, remainingMonths: v.remainingMonths ?? null, dueDay: v.dueDay ?? null };
      u.debts.push(row);
      save();
      return debtDto(row);
    },
    async updateDebt(id, d) {
      const { u } = me();
      const row = u.debts.find((x) => x.id === id);
      if (!row) throw new ApiError(404, "not_found", "Not found");
      Object.assign(row, Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined)));
      save();
      return debtDto(row);
    },
    async deleteDebt(id) {
      const { u } = me();
      u.debts = u.debts.filter((x) => x.id !== id);
      save();
    },
    async simulateDebts(extra): Promise<DebtSimulation> {
      const { u } = me();
      const input = u.debts.map((d) => ({ id: d.id, name: d.lender || d.type, balance: d.balance, annualRatePercent: d.ratePercent, minimumPayment: d.monthlyPayment }));
      return {
        snowball: simulateDebtStrategy(input, extra, "snowball"),
        avalanche: simulateDebtStrategy(input, extra, "avalanche"),
        perDebt: u.debts.map((d) => ({ id: d.id, ...simulateExtraPayment(d.balance, d.ratePercent, d.monthlyPayment, extra) })),
      };
    },
    async monthlyReport(month): Promise<MonthlyReport> {
      const { u } = me();
      dashboardFor(u);
      const m = month ?? monthKeyOf(new Date());
      const [y, mo] = m.split("-").map(Number) as [number, number];
      const prev = mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
      const notSaving = (k: string) => k !== "savings" && k !== "investments";
      const sum = (mm: string, type: string) => u.transactions.filter((t) => t.date.startsWith(mm) && t.type === type && (type === "income" || notSaving(t.categoryKey))).reduce((a, t) => a.plus(t.amount), D(0));
      const income = sum(m, "income");
      const expenses = sum(m, "expense");
      const savings = income.minus(expenses);
      const prevSavings = sum(prev, "income").minus(sum(prev, "expense"));
      const cats = new Map<string, number>();
      for (const t of u.transactions.filter((t) => t.date.startsWith(m) && t.type === "expense" && notSaving(t.categoryKey))) cats.set(t.categoryKey, (cats.get(t.categoryKey) ?? 0) + t.amount);
      const top = [...cats.entries()].sort((a, b) => b[1] - a[1])[0];
      const b = u.budgets[m];
      return {
        month: m,
        income: income.toNumber(),
        expenses: expenses.toNumber(),
        savings: savings.toNumber(),
        savingsRate: income.gt(0) ? toPercent(savings.div(income)) : 0,
        savingsVsLast: savings.minus(prevSavings).toNumber(),
        largestCategory: top ? { categoryKey: top[0], total: top[1] } : null,
        budgetAccuracy: b?.items.length ? Math.round((b.items.filter((i) => (cats.get(i.categoryKey) ?? 0) <= i.planned).length / b.items.length) * 100) : null,
        goalContributions: u.goals.flatMap((g) => g.contributions).filter((c) => monthKeyOf(new Date(c.at)) === m).reduce((a, c) => a + c.amount, 0),
        healthScore: u.healthScores[m] ?? null,
        healthScorePrev: u.healthScores[prev] ?? null,
        lessonsCompleted: Object.values(u.learning.completed).filter((c) => monthKeyOf(new Date(c.completedAt)) === m).length,
        badges: u.learning.badges.filter((x) => monthKeyOf(new Date(x.earnedAt)) === m).map((x) => x.key),
      };
    },

    courses: async () => delay(courses()),
    async lesson(slug): Promise<LessonDTO> {
      const r = findLessonRow(slug);
      if (!r || r.status !== "published") throw new ApiError(404, "not_found", "Lesson not found");
      return { ...r.lesson, courseSlug: r.courseSlug, status: r.status };
    },
    learning: async () => learningState(me().u),
    async completeLesson(slug, answers) {
      const { u } = me();
      const r = findLessonRow(slug);
      if (!r) throw new ApiError(404, "not_found", "Lesson not found");
      const graded = gradeQuiz(r.lesson, answers);
      const first = !u.learning.completed[slug];
      const xp = xpForAttempt(r.lesson, first, graded.correct, graded.total);
      const prevBest = u.learning.completed[slug]?.score ?? 0;
      u.learning.completed[slug] = { score: Math.max(prevBest, graded.correct), total: graded.total, completedAt: u.learning.completed[slug]?.completedAt ?? nowIso() };
      u.learning.attempts.push({ slug, score: graded.correct, total: graded.total, at: nowIso() });
      const streak = updateStreak({ streak: u.learning.streak, longestStreak: u.learning.longestStreak, lastActiveDate: u.learning.lastActiveDate }, colomboDate());
      Object.assign(u.learning, streak);
      u.learning.xp += xp;
      const newBadges = award(u, graded.correct === graded.total);
      const state = learningState(u);
      for (const c of state.challenges.filter((c) => c.completed)) {
        const rec = u.learning.challenges.find((x) => x.key === c.key);
        if (rec && !rec.completedAt) rec.completedAt = nowIso();
      }
      save();
      return { correct: graded.correct, total: graded.total, xpEarned: xp, newBadges, results: graded.results, learning: learningState(u) };
    },
    async joinChallenge(key) {
      const { u } = me();
      if (!u.learning.challenges.some((c) => c.key === key)) u.learning.challenges.push({ key, joinedAt: nowIso(), completedAt: null });
      save();
      return learningState(u);
    },
    async completeChallenge(key) {
      const { u } = me();
      const def = CHALLENGES.find((c) => c.key === key);
      if (!def || def.metric !== "subscriptionReview") throw new ApiError(404, "not_found", "Not found");
      const rec = u.learning.challenges.find((c) => c.key === key);
      if (rec) rec.completedAt = nowIso();
      else u.learning.challenges.push({ key, joinedAt: nowIso(), completedAt: nowIso() });
      save();
      return learningState(u);
    },

    async notifications() {
      const { u } = me();
      const d = dashboardFor(u);
      const p = u.preferences;
      if (p.notifyBills) for (const b of d.upcomingBills.filter((b) => b.daysUntil <= 3)) notify(u, "notifications.billDue", { name: b.name, n: b.daysUntil }, `bill:${b.id}:${b.nextDue}`);
      if (p.notifyBudget && d.budget) for (const x of d.budget.progress.filter((x) => x.percentUsed >= 80)) notify(u, "notifications.budgetNear", { category: x.categoryKey, percent: Math.round(x.percentUsed) }, `budget:${d.month}:${x.categoryKey}:${x.percentUsed >= 100 ? 100 : 80}`);
      if (p.notifyGoals) for (const g of d.goals.filter((g) => g.status === "active" && g.target - g.saved > 0 && g.target - g.saved <= 5000)) notify(u, "notifications.goalClose", { amount: Math.round(g.target - g.saved), goal: g.name }, `goal:${g.id}:close`);
      const yesterday = colomboDate(new Date(Date.now() - 86_400_000));
      if (p.notifyLearning && u.learning.streak >= 2 && u.learning.lastActiveDate === yesterday) notify(u, "notifications.streak", { n: u.learning.streak }, `streak:${colomboDate()}`);
      save();
      return u.notifications.slice(0, 50).map(({ dedupeKey: _k, ...n }) => n);
    },
    async readNotification(id) {
      const n = me().u.notifications.find((x) => x.id === id);
      if (n) n.read = true;
      save();
    },
    async readAllNotifications() {
      me().u.notifications.forEach((n) => (n.read = true));
      save();
    },

    checkScam: async (text) => delay(checkScamMessage(text)),
    async ask({ question, lang }) {
      const st = s();
      const acc = st.accounts.find((a) => a.id === st.sessionUserId);
      const u = acc ? st.users[acc.id] : undefined;
      const personal = [/how much (did|have) i|how much .* (i|my)\b|analy[sz]e my|my spending|did i spend|have i spent|where (did|does) my money|why am i spending|my (income|expenses|savings rate)/i, /මම .*කීයද|මගේ වියදම්|වියදම් විශ්ලේෂණය|මගේ මුදල් කොහේ|මම කොපමණ/, /நான் .*எவ்வளவு|என் செலவ|செலவுகளை ஆய்வு|என் பணம் எங்கே|எவ்வளவு செலவழித்தேன்/].some((r) => r.test(question));
      if (personal) {
        if (!u?.consents.aiDataAccess) return delay({ answer: translate(lang, "ai.personalOff"), mode: "personal" as const, sources: [], usedFields: [], relatedLesson: null, actions: [] });
        const month = monthKeyOf(new Date());
        const exp = u.transactions.filter((t) => t.date.startsWith(month) && t.type === "expense" && t.categoryKey !== "savings" && t.categoryKey !== "investments");
        if (!exp.length) return delay({ answer: translate(lang, "ai.personal.noData"), mode: "personal" as const, sources: [], usedFields: [], relatedLesson: null, actions: [] });
        const lower = question.toLowerCase();
        const extra: Record<string, string[]> = { food: ["food", "grocer", "rice", "delivery", "කෑම", "හාල්", "சாப்பாடு"], transport: ["transport", "bus", "train", "fuel", "tuk", "බස්", "பேருந்து"] };
        let group: string | null = null;
        for (const l of ["en", "si", "ta"] as Lang[]) for (const [g, name] of Object.entries(dictionaries[l].groups)) if (!group && lower.includes(name.toLowerCase())) group = g;
        for (const [g, words] of Object.entries(extra)) if (!group && words.some((w) => lower.includes(w))) group = g;
        const money = (n: number) => formatMoney(n, lang);
        if (group) {
          const total = exp.filter((e) => getCategory(e.categoryKey).group === group).reduce((a, e) => a + e.amount, 0);
          return delay({ answer: translate(lang, "ai.personal.spentCategory", { amount: money(total), category: translate(lang, `groups.${group}`) }), mode: "personal" as const, sources: [], usedFields: [`expenses.${group}.${month}`], relatedLesson: null, actions: [] });
        }
        const income = u.transactions.filter((t) => t.date.startsWith(month) && t.type === "income").reduce((a, t) => a + t.amount, 0);
        const spent = exp.reduce((a, e) => a + e.amount, 0);
        const byGroup = new Map<string, number>();
        for (const e of exp) byGroup.set(getCategory(e.categoryKey).group, (byGroup.get(getCategory(e.categoryKey).group) ?? 0) + e.amount);
        const top = [...byGroup.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
        const parts = [translate(lang, "ai.personal.spentTotal", { amount: money(spent), income: money(income) })];
        if (income > 0) parts.push(translate(lang, "ai.personal.savingRate", { rate: Math.max(0, Math.round(((income - spent) / income) * 100)) }));
        parts.push(translate(lang, "ai.personal.topCategories", { list: top.map(([g, v]) => `${translate(lang, `groups.${g}`)} (${money(v)})`).join(", ") }));
        return delay({ answer: parts.join(" "), mode: "personal" as const, sources: [], usedFields: [`expenses.total.${month}`, `income.total.${month}`, `expenses.topGroups.${month}`], relatedLesson: "budgeting-basics", actions: ["learnBudget" as const, "createBudget" as const] });
      }
      const hits = searchKnowledge(KNOWLEDGE, question, 3);
      if (u) {
        const topic = hits[0]?.entry.id ?? "unanswered";
        u.aiTopics[topic] = (u.aiTopics[topic] ?? 0) + 1;
        save();
      }
      if (!hits.length) return delay({ answer: translate(lang, "ai.lowConfidence"), mode: "low-confidence" as const, sources: [], usedFields: [], relatedLesson: null, actions: [] });
      const e = hits[0]!.entry;
      return delay({
        answer: e.answer[lang],
        mode: "knowledge" as const,
        sources: e.sources.map((x) => ({ ...x, lastReviewed: e.lastReviewed })),
        usedFields: [],
        relatedLesson: e.relatedLesson ?? null,
        actions: e.id === "budgeting" ? (["analyse", "learnBudget", "createBudget"] as const).slice() : [],
      });
    },
    clearAiHistory: async () => undefined,

    async adminStats() {
      assertRole("moderator");
      const st = s();
      const users = Object.values(st.users);
      const langs = new Map<Lang, number>();
      users.forEach((u) => langs.set(u.profile.language, (langs.get(u.profile.language) ?? 0) + 1));
      const attempts = users.flatMap((u) => [...u.learning.attempts, ...Object.entries(u.learning.completed).map(([slug, c]) => ({ slug, score: c.score, total: c.total, at: c.completedAt }))]);
      const per = new Map<string, { s: number; t: number; n: number }>();
      attempts.forEach((a) => {
        const cur = per.get(a.slug) ?? { s: 0, t: 0, n: 0 };
        per.set(a.slug, { s: cur.s + a.score, t: cur.t + a.total, n: cur.n + 1 });
      });
      const topics = new Map<string, number>();
      users.forEach((u) => Object.entries(u.aiTopics).forEach(([k, v]) => topics.set(k, (topics.get(k) ?? 0) + v)));
      const totS = attempts.reduce((a, x) => a + x.score, 0);
      const totT = attempts.reduce((a, x) => a + x.total, 0);
      const days = new Map<string, number>();
      st.accounts.forEach((a) => days.set(a.createdAt.slice(0, 10), (days.get(a.createdAt.slice(0, 10)) ?? 0) + 1));
      return {
        users: st.accounts.length,
        activeUsers30d: st.accounts.length,
        lessonsCompleted: users.reduce((a, u) => a + Object.keys(u.learning.completed).length, 0),
        quizSuccessRate: totT ? Math.round((totS / totT) * 100) : 0,
        budgets: users.reduce((a, u) => a + Object.keys(u.budgets).length, 0),
        goals: users.reduce((a, u) => a + u.goals.length, 0),
        languages: [...langs.entries()].map(([lang, count]) => ({ lang, count })),
        hardestLessons: [...per.entries()].map(([slug, v]) => ({ slug, avgScore: Math.round((v.s / v.t) * 100), attempts: v.n })).sort((a, b) => a.avgScore - b.avgScore).slice(0, 5),
        topAiTopics: [...topics.entries()].map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 8),
        signupsByDay: [...days.entries()].map(([day, count]) => ({ day, count })).sort((a, b) => a.day.localeCompare(b.day)),
      };
    },
    async adminUsers(q) {
      assertRole("admin");
      const st = s();
      return st.accounts
        .filter((a) => !q || a.email.includes(q.toLowerCase()))
        .map((a): AdminUser => ({ id: a.id, email: a.email, role: a.role, name: st.users[a.id]?.profile.name ?? null, language: st.users[a.id]?.profile.language ?? null, createdAt: a.createdAt, lastLoginAt: null }));
    },
    async adminSetRole(id, role) {
      assertRole("admin");
      const acc = s().accounts.find((a) => a.id === id);
      if (!acc || acc.id === me().acc.id) throw new ApiError(403, "forbidden", "Forbidden");
      acc.role = role as RoleName;
      audit("admin.role_changed", id);
      save();
    },
    async adminLessons() {
      assertRole("creator");
      return lessonRows().map(
        (r): AdminLessonDTO => ({ slug: r.lesson.slug, courseSlug: r.courseSlug, title: r.lesson.title, status: r.status, author: r.author, reviewer: r.reviewer, lastReviewed: r.lesson.lastReviewed, nextReview: r.lesson.nextReview, timeSensitive: !!r.lesson.timeSensitive, updatedAt: r.updatedAt }),
      );
    },
    async adminLesson(slug) {
      assertRole("creator");
      const r = findLessonRow(slug);
      if (!r) throw new ApiError(404, "not_found", "Not found");
      return { ...r.lesson, courseSlug: r.courseSlug, status: r.status };
    },
    async adminSaveLesson(l: LessonUpsert) {
      assertRole("creator");
      const st = s();
      const existing = findLessonRow(l.slug);
      const today = colomboDate();
      const { courseSlug, nextReview, ...rest } = l;
      const lesson: Lesson = { ...rest, lastReviewed: existing?.lesson.lastReviewed ?? today, nextReview: nextReview ?? existing?.lesson.nextReview ?? today };
      st.lessonOverrides[l.slug] = { courseSlug, lesson, status: existing && me().acc.role !== "user" && ["admin", "superadmin"].includes(me().acc.role) ? existing.status : "draft", author: existing?.author ?? me().acc.email, reviewer: existing?.reviewer ?? null, updatedAt: nowIso() };
      audit(existing ? "cms.lesson_updated" : "cms.lesson_created", l.slug);
      save();
      return { ...lesson, courseSlug, status: st.lessonOverrides[l.slug]!.status };
    },
    async adminSetLessonStatus(slug, status) {
      assertRole("creator");
      const st = s();
      const r = findLessonRow(slug);
      if (!r) throw new ApiError(404, "not_found", "Not found");
      const allowed: Record<string, string[]> = { review: ["draft"], approved: ["review"], published: ["approved", "archived"], archived: ["draft", "review", "approved", "published"], draft: ["review", "approved", "archived"] };
      if (!allowed[status]?.includes(r.status)) throw new ApiError(400, "invalid_transition", "Invalid transition");
      st.lessonOverrides[slug] = { ...r, status, reviewer: status === "approved" ? me().acc.email : r.reviewer, lesson: status === "approved" ? { ...r.lesson, lastReviewed: colomboDate() } : r.lesson, updatedAt: nowIso() };
      audit("cms.status_changed", slug);
      save();
    },
    async adminAuditLogs() {
      assertRole("admin");
      return s().audit;
    },
  };
}
