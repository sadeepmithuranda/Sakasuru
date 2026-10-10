import { describe, expect, it } from "vitest";
import { COURSES, ALL_LESSONS, KNOWLEDGE, searchKnowledge, searchLessons, SCAM_EXAMPLES, BADGES, levelForXp, type L } from "./index.js";
import { checkScamMessage } from "../../financial-engine/src/scam-checker.js";

const complete = (l: L | undefined) => !!l && !!l.en.trim() && !!l.si.trim() && !!l.ta.trim();

describe("course content", () => {
  it("has unique lesson slugs", () => {
    const slugs = ALL_LESSONS.map((x) => x.lesson.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("covers all eight levels", () => {
    expect(COURSES.map((c) => c.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  for (const { course, lesson } of ALL_LESSONS) {
    describe(`${course.slug}/${lesson.slug}`, () => {
      it("is fully trilingual", () => {
        expect(complete(lesson.title)).toBe(true);
        expect(complete(lesson.summary)).toBe(true);
        for (const c of lesson.cards) {
          expect(complete(c.body)).toBe(true);
          if (c.title) expect(complete(c.title)).toBe(true);
          c.options?.forEach((o) => expect(complete(o.text)).toBe(true));
          if (c.options) expect(complete(c.explanation)).toBe(true);
        }
      });
      it("has a valid 3–10 question quiz with explanations", () => {
        expect(lesson.quiz.length).toBeGreaterThanOrEqual(3);
        expect(lesson.quiz.length).toBeLessThanOrEqual(10);
        for (const q of lesson.quiz) {
          expect(q.options.map((o) => o.id)).toContain(q.correctId);
          expect(complete(q.prompt)).toBe(true);
          expect(complete(q.explanation)).toBe(true);
        }
      });
      it("question cards have exactly one correct option", () => {
        for (const c of lesson.cards.filter((c) => c.type === "question")) expect(c.options!.filter((o) => o.correct)).toHaveLength(1);
      });
      it("has sources and review dates", () => {
        expect(lesson.sources.length).toBeGreaterThan(0);
        expect(lesson.nextReview > lesson.lastReviewed).toBe(true);
      });
    });
  }
});

describe("knowledge base", () => {
  it("entries are trilingual and sourced", () => {
    for (const k of KNOWLEDGE) {
      expect(complete(k.answer)).toBe(true);
      expect(k.sources.length).toBeGreaterThan(0);
    }
  });
  it("retrieves in English, Sinhala and Tamil", () => {
    expect(searchKnowledge(KNOWLEDGE, "What is a fixed deposit?")[0]?.entry.id).toBe("fixed-deposit");
    expect(searchKnowledge(KNOWLEDGE, "උද්ධමනය යනු කුමක්ද?")[0]?.entry.id).toBe("inflation");
    expect(searchKnowledge(KNOWLEDGE, "கூட்டு வட்டி எப்படி வேலை செய்கிறது?")[0]?.entry.id).toBe("compound-interest");
    expect(searchKnowledge(KNOWLEDGE, "Explain Treasury Bills")[0]?.entry.id).toBe("treasury-bills");
    expect(searchKnowledge(KNOWLEDGE, "What is LANKAQR?")[0]?.entry.id).toBe("lankaqr");
    expect(searchKnowledge(KNOWLEDGE, "I earn Rs. 90,000 but I cannot save anything")[0]?.entry.id).toBe("budgeting");
  });
  it("returns nothing for unrelated questions", () => {
    expect(searchKnowledge(KNOWLEDGE, "who won the cricket match yesterday")).toHaveLength(0);
  });
});

describe("lesson search", () => {
  it("'loan' and 'ණය' find the loans lesson", () => {
    expect(searchLessons(COURSES, "loan").some((h) => h.lesson.slug === "loans-and-interest")).toBe(true);
    expect(searchLessons(COURSES, "ණය").some((h) => h.lesson.slug === "loans-and-interest")).toBe(true);
  });
});

describe("scam examples agree with the checker", () => {
  for (const ex of SCAM_EXAMPLES) {
    it(ex.id, () => {
      const r = checkScamMessage(ex.message.en);
      if (ex.isScam) expect(r.risk).not.toBe("low");
      else expect(r.risk).toBe("low");
    });
  }
});

describe("gamification", () => {
  it("badges never reward borrowing or trading", () => {
    const text = BADGES.map((b) => b.description.en.toLowerCase()).join(" ");
    expect(text).not.toMatch(/borrow|trade |trades|leverage/);
  });
  it("xp levels", () => {
    expect(levelForXp(0).level).toBe(1);
    expect(levelForXp(100).level).toBe(2);
    expect(levelForXp(250).level).toBe(3);
  });
});

describe("recommendation guardrail", () => {
  it("routes 'which stock should I buy' to the no-recommendation answer", () => {
    expect(searchKnowledge(KNOWLEDGE, "Which stock should I buy right now?")[0]?.entry.id).toBe("recommendation-request");
  });
});
