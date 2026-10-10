export type Lang = "en" | "si" | "ta";
export const LANGS: Lang[] = ["si", "ta", "en"];

/** A string in all three languages. */
export interface L {
  en: string;
  si: string;
  ta: string;
}

export type CardType = "story" | "concept" | "example" | "question" | "tip" | "warning";

export interface LessonCard {
  type: CardType;
  title?: L;
  body: L;
  /** for "question" cards: a quick check inside the lesson */
  options?: { text: L; correct: boolean }[];
  explanation?: L;
}

export type QuestionType = "mcq" | "truefalse" | "scenario" | "calculation";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: L;
  options: { id: string; text: L }[];
  correctId: string;
  explanation: L;
}

export interface SourceRef {
  name: string;
  url: string;
}

export interface Lesson {
  slug: string;
  title: L;
  summary: L;
  minutes: number;
  xp: number;
  tags: string[];
  /** counts toward the "protection awareness" health factor */
  protection?: boolean;
  /** contains facts that can change (rates, laws) and needs periodic review */
  timeSensitive?: boolean;
  cards: LessonCard[];
  quiz: QuizQuestion[];
  sources: SourceRef[];
  lastReviewed: string;
  nextReview: string;
}

export interface Course {
  slug: string;
  level: number;
  icon: string;
  color: string;
  title: L;
  description: L;
  lessons: Lesson[];
  /** lessons that must be completed first (personalisation rule, e.g. before investing) */
  prerequisites?: string[];
}

export interface KnowledgeEntry {
  id: string;
  /** multilingual keywords used for retrieval */
  keywords: string[];
  question: L;
  answer: L;
  sources: SourceRef[];
  timeSensitive: boolean;
  lastReviewed: string;
  relatedLesson?: string;
}

export interface ScamExample {
  id: string;
  message: L;
  isScam: boolean;
  explanation: L;
}

export const REVIEWED = "2026-10-10";
export const NEXT_REVIEW = "2027-04-10";
export const NEXT_REVIEW_TIME_SENSITIVE = "2027-01-10";

export const SOURCES = {
  cbsl: { name: "Central Bank of Sri Lanka", url: "https://www.cbsl.gov.lk" },
  cbslFinLit: { name: "CBSL — Financial Literacy", url: "https://www.cbsl.gov.lk/en/financial-system/financial-literacy" },
  lankaqr: { name: "CBSL — LANKAQR", url: "https://www.cbsl.gov.lk/en/payments-and-settlements/lankaqr" },
  sec: { name: "Securities and Exchange Commission of Sri Lanka", url: "https://www.sec.gov.lk" },
  cse: { name: "Colombo Stock Exchange", url: "https://www.cse.lk" },
  ird: { name: "Inland Revenue Department", url: "https://www.ird.gov.lk" },
  epf: { name: "Employees' Provident Fund (CBSL)", url: "https://epf.lk" },
  etf: { name: "Employees' Trust Fund Board", url: "https://www.etfb.lk" },
  publicDebt: { name: "CBSL — Public Debt Department", url: "https://www.cbsl.gov.lk/en/financial-system/public-debt" },
  cbslInflation: { name: "CBSL — Inflation", url: "https://www.cbsl.gov.lk/en/measures-of-consumer-price-inflation" },
  sakasuru: { name: "සකසුරු education team", url: "https://github.com/sadeepmithuranda/sakasuru" },
} satisfies Record<string, SourceRef>;

/** Standard True / False options for quiz questions. */
export const TF = [
  { id: "t", text: { en: "True", si: "සත්‍යයි", ta: "சரி" } },
  { id: "f", text: { en: "False", si: "අසත්‍යයි", ta: "தவறு" } },
];

/** Same text in all languages (numbers, amounts). */
export const same = (s: string): L => ({ en: s, si: s, ta: s });
/** Rupee amount label in each language. */
export const rs = (amount: string): L => ({ en: `Rs. ${amount}`, si: `රු. ${amount}`, ta: `ரூ. ${amount}` });
