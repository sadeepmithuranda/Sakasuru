import type {
  MeDTO,
  ProfileDTO,
  Preferences,
  Consents,
  TransactionDTO,
  TransactionInput,
  RecurringDTO,
  RecurringInput,
  BudgetDTO,
  BudgetInput,
  GoalDTO,
  GoalInput,
  DebtDTO,
  DebtInput,
  DashboardDTO,
  HealthHistoryPoint,
  CourseSummaryDTO,
  LessonDTO,
  LearningStateDTO,
  LessonCompleteResultDTO,
  NotificationDTO,
  AiAnswerDTO,
  AskInput,
  SessionDTO,
  AdminStatsDTO,
  AdminLessonDTO,
  AuditLogDTO,
  LessonUpsert,
  ContentStatus,
  RegisterInput,
  ProfileUpdate,
} from "@sakasuru/validation";
import type { ScamCheckResult, StrategyResult } from "@sakasuru/financial-engine";

export interface AuthResult {
  me: MeDTO;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  savingsVsLast: number;
  largestCategory: { categoryKey: string; total: number } | null;
  budgetAccuracy: number | null;
  goalContributions: number;
  healthScore: number | null;
  healthScorePrev: number | null;
  lessonsCompleted: number;
  badges: string[];
}

export interface DebtSimulation {
  snowball: StrategyResult;
  avalanche: StrategyResult;
  perDebt: {
    id: string;
    current: { months: number | null; totalInterest: number; payoffDate: string | null; paysOff: boolean };
    improved: { months: number | null; totalInterest: number; payoffDate: string | null; paysOff: boolean };
    monthsSaved: number | null;
    interestSaved: number | null;
  }[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string | null;
  language: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * One interface, two implementations:
 *  - RemoteApi talks to the Fastify + PostgreSQL backend.
 *  - LocalApi is the on-device demo/offline store (same domain logic).
 */
export interface Api {
  readonly mode: "remote" | "local";

  register(input: RegisterInput): Promise<AuthResult>;
  login(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  restore(): Promise<MeDTO | null>;
  startDemo?(): Promise<AuthResult>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  sessions(): Promise<SessionDTO[]>;
  revokeSession(id: string): Promise<void>;

  updateProfile(p: ProfileUpdate): Promise<ProfileDTO>;
  updatePreferences(p: Partial<Preferences>): Promise<Preferences>;
  updateConsents(c: Partial<Consents>): Promise<Consents>;
  exportData(): Promise<unknown>;
  deleteAccount(): Promise<void>;

  dashboard(): Promise<DashboardDTO>;
  healthHistory(): Promise<HealthHistoryPoint[]>;
  transactions(q?: { from?: string; to?: string }): Promise<TransactionDTO[]>;
  addTransaction(t: TransactionInput): Promise<TransactionDTO>;
  updateTransaction(id: string, t: Partial<TransactionInput>): Promise<TransactionDTO>;
  deleteTransaction(id: string): Promise<void>;
  importTransactions(rows: { date: string; amount: number; description?: string; categoryKey?: string }[]): Promise<number>;
  recurring(): Promise<RecurringDTO[]>;
  addRecurring(r: RecurringInput): Promise<RecurringDTO[]>;
  updateRecurring(id: string, r: Partial<RecurringInput>): Promise<RecurringDTO[]>;
  deleteRecurring(id: string): Promise<void>;
  budget(month: string): Promise<BudgetDTO | null>;
  saveBudget(month: string, b: BudgetInput): Promise<BudgetDTO>;
  goals(): Promise<GoalDTO[]>;
  addGoal(g: GoalInput): Promise<GoalDTO>;
  updateGoal(id: string, g: Partial<GoalInput>): Promise<GoalDTO>;
  deleteGoal(id: string): Promise<void>;
  contribute(id: string, amount: number): Promise<GoalDTO>;
  debts(): Promise<DebtDTO[]>;
  addDebt(d: DebtInput): Promise<DebtDTO>;
  updateDebt(id: string, d: Partial<DebtInput>): Promise<DebtDTO>;
  deleteDebt(id: string): Promise<void>;
  simulateDebts(extra: number): Promise<DebtSimulation>;
  monthlyReport(month?: string): Promise<MonthlyReport>;

  courses(): Promise<CourseSummaryDTO[]>;
  lesson(slug: string): Promise<LessonDTO>;
  learning(): Promise<LearningStateDTO>;
  completeLesson(slug: string, answers: Record<string, string>): Promise<LessonCompleteResultDTO>;
  joinChallenge(key: string): Promise<LearningStateDTO>;
  completeChallenge(key: string): Promise<LearningStateDTO>;

  notifications(): Promise<NotificationDTO[]>;
  readNotification(id: string): Promise<void>;
  readAllNotifications(): Promise<void>;

  checkScam(text: string): Promise<ScamCheckResult>;
  ask(input: AskInput): Promise<AiAnswerDTO>;
  clearAiHistory(): Promise<void>;

  adminStats(): Promise<AdminStatsDTO>;
  adminUsers(q?: string): Promise<AdminUser[]>;
  adminSetRole(userId: string, role: string): Promise<void>;
  adminLessons(): Promise<AdminLessonDTO[]>;
  adminLesson(slug: string): Promise<LessonDTO>;
  adminSaveLesson(lesson: LessonUpsert): Promise<LessonDTO>;
  adminSetLessonStatus(slug: string, status: ContentStatus): Promise<void>;
  adminAuditLogs(): Promise<AuditLogDTO[]>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
