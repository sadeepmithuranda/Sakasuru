import type { Lesson } from "./types.js";
import { BADGES, CHALLENGES, levelForXp } from "./gamification.js";

/**
 * Pure learning-domain rules shared by the API and the offline/demo store.
 */

export function gradeQuiz(lesson: Lesson, answers: Record<string, string>) {
  const results: Record<string, { correct: boolean; correctId: string }> = {};
  let correct = 0;
  for (const q of lesson.quiz) {
    const ok = answers[q.id] === q.correctId;
    if (ok) correct++;
    results[q.id] = { correct: ok, correctId: q.correctId };
  }
  return { correct, total: lesson.quiz.length, results };
}

/** Calendar date in Sri Lanka (UTC+05:30), yyyy-mm-dd — streaks follow local days. */
export function colomboDate(d: Date = new Date()): string {
  const shifted = new Date(d.getTime() + 330 * 60_000);
  return shifted.toISOString().slice(0, 10);
}

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86_400_000);

export interface StreakState {
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export function updateStreak(state: StreakState, today: string): StreakState {
  if (state.lastActiveDate === today) return state;
  const gap = state.lastActiveDate ? dayDiff(state.lastActiveDate, today) : Infinity;
  const streak = gap === 1 ? state.streak + 1 : 1;
  return { streak, longestStreak: Math.max(state.longestStreak, streak), lastActiveDate: today };
}

/** XP for a quiz attempt: full lesson XP on first completion, +10 for a perfect first score; 5 XP for later practice. */
export function xpForAttempt(lesson: Lesson, firstCompletion: boolean, correct: number, total: number): number {
  if (!firstCompletion) return correct === total ? 5 : 0;
  const base = Math.round(lesson.xp * Math.max(correct / total, 0.5));
  return base + (correct === total ? 10 : 0);
}

export interface BadgeContext {
  expenseCount: number;
  budgetCount: number;
  bestMonthSavingRate: number;
  lessonsCompleted: string[];
  protectionLessons: string[];
  investingLessons: string[];
  streak: number;
  budgetAllWithinLastMonth: boolean;
  emergencyContributed: boolean;
  perfectQuiz: boolean;
}

export function evaluateBadges(ctx: BadgeContext, alreadyEarned: string[]): string[] {
  const has = new Set(alreadyEarned);
  const done = new Set(ctx.lessonsCompleted);
  const rules: Record<string, boolean> = {
    firstExpense: ctx.expenseCount >= 1,
    firstBudget: ctx.budgetCount >= 1,
    smartSaver: ctx.bestMonthSavingRate >= 10,
    moneyLearner: ctx.lessonsCompleted.length >= 5,
    scamDefender: ctx.protectionLessons.length > 0 && ctx.protectionLessons.every((s) => done.has(s)),
    investmentExplorer: ctx.investingLessons.length > 0 && ctx.investingLessons.every((s) => done.has(s)),
    streak7: ctx.streak >= 7,
    budgetMaster: ctx.budgetAllWithinLastMonth,
    emergencyStarter: ctx.emergencyContributed,
    quizAce: ctx.perfectQuiz,
  };
  return BADGES.map((b) => b.key).filter((k) => rules[k] && !has.has(k));
}

export const badgeXp = (key: string) => BADGES.find((b) => b.key === key)?.xp ?? 0;

export interface ChallengeMetrics {
  expenseDays: number;
  lessons: number;
  savedAmount: number;
  noSpendDays: number;
  subscriptionReview: number;
  emergencyContribution: number;
}

export function challengeProgress(key: string, metrics: ChallengeMetrics) {
  const def = CHALLENGES.find((c) => c.key === key);
  if (!def) return null;
  const progress = Math.min(metrics[def.metric], def.target);
  return { progress, target: def.target, completed: progress >= def.target };
}

export { levelForXp };
