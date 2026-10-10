import { describe, expect, it } from "vitest";
import { createLocalApi } from "../local";

// The on-device store must follow the same rules as the API.
describe("local (demo/offline) store", () => {
  const api = createLocalApi();

  it("registers and computes the dashboard with the shared engine", async () => {
    const { me } = await api.register({ email: "nimal@example.lk", password: "a long password", name: "Nimal", language: "en", acceptTerms: true });
    expect(me.profile.name).toBe("Nimal");
    const today = new Date().toISOString().slice(0, 10);
    await api.addTransaction({ type: "income", amount: 80000, categoryKey: "salary", date: today });
    const tx = await api.addTransaction({ type: "expense", amount: 20000, categoryKey: "rent", date: today });
    expect(tx.needWant).toBe("need");
    const d = await api.dashboard();
    expect(d.income).toBe(80000);
    expect(d.spent).toBe(20000);
    expect(d.health.factors).toHaveLength(8);
  });

  it("rejects invalid input like the API", async () => {
    await expect(api.addTransaction({ type: "expense", amount: -1, categoryKey: "rent", date: "2026-10-10" })).rejects.toThrow();
  });

  it("grades lessons and awards XP once", async () => {
    const lesson = await api.lesson("why-save");
    const answers = Object.fromEntries(lesson.quiz.map((q) => [q.id, q.correctId]));
    const first = await api.completeLesson("why-save", answers);
    expect(first.xpEarned).toBe(30);
    const again = await api.completeLesson("why-save", answers);
    expect(again.xpEarned).toBe(5);
  });

  it("keeps personal AI answers behind consent", async () => {
    const off = await api.ask({ question: "How much did I spend on food this month?", lang: "en" });
    expect(off.usedFields).toEqual([]);
    await api.updateConsents({ aiDataAccess: true });
    const on = await api.ask({ question: "How much did I spend on housing this month?", lang: "en" });
    expect(on.answer).toContain("Rs. 20,000");
  });

  it("blocks admin features for regular users", async () => {
    await expect(api.adminStats()).rejects.toThrow();
  });
});
