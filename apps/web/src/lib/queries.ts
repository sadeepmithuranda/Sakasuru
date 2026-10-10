import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api-context";

export const keys = {
  dashboard: ["dashboard"] as const,
  transactions: ["transactions"] as const,
  recurring: ["recurring"] as const,
  budget: (m: string) => ["budget", m] as const,
  goals: ["goals"] as const,
  debts: ["debts"] as const,
  courses: ["courses"] as const,
  lesson: (s: string) => ["lesson", s] as const,
  learning: ["learning"] as const,
  notifications: ["notifications"] as const,
  history: ["health-history"] as const,
};

export const useDashboard = () => useQuery({ queryKey: keys.dashboard, queryFn: () => api.dashboard() });
export const useTransactions = () => useQuery({ queryKey: keys.transactions, queryFn: () => api.transactions() });
export const useRecurring = () => useQuery({ queryKey: keys.recurring, queryFn: () => api.recurring() });
export const useBudget = (m: string) => useQuery({ queryKey: keys.budget(m), queryFn: () => api.budget(m) });
export const useGoals = () => useQuery({ queryKey: keys.goals, queryFn: () => api.goals() });
export const useDebts = () => useQuery({ queryKey: keys.debts, queryFn: () => api.debts() });
export const useCourses = () => useQuery({ queryKey: keys.courses, queryFn: () => api.courses(), staleTime: 5 * 60_000 });
export const useLesson = (s: string) => useQuery({ queryKey: keys.lesson(s), queryFn: () => api.lesson(s), staleTime: 5 * 60_000 });
export const useLearning = () => useQuery({ queryKey: keys.learning, queryFn: () => api.learning() });
export const useNotifications = () => useQuery({ queryKey: keys.notifications, queryFn: () => api.notifications() });
export const useHealthHistory = () => useQuery({ queryKey: keys.history, queryFn: () => api.healthHistory() });

/** Mutation that refreshes everything money-related afterwards. */
export function useMoneyMutation<TVars, TRes>(fn: (v: TVars) => Promise<TRes>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const k of ["dashboard", "transactions", "recurring", "budget", "goals", "debts", "learning", "notifications", "health-history"]) qc.invalidateQueries({ queryKey: [k] });
    },
  });
}
