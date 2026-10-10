import type { Course, KnowledgeEntry, Lang, Lesson } from "./types.js";

const norm = (s: string) => s.normalize("NFC").toLowerCase();

/** Sinhala/Tamil/English synonyms so "loan" and "ණය" find the same material. */
const SYNONYMS: string[][] = [
  ["loan", "loans", "debt", "ණය", "கடன்"],
  ["save", "saving", "savings", "ඉතිරි", "சேமிப்பு", "சேமி"],
  ["budget", "අයවැය", "வரவுசெலவு"],
  ["inflation", "උද්ධමනය", "பணவீக்கம்"],
  ["interest", "පොලී", "வட்டி"],
  ["scam", "fraud", "වංචා", "மோசடி"],
  ["tax", "බදු", "வரி"],
  ["invest", "investment", "ආයෝජන", "முதலீடு"],
  ["emergency", "හදිසි", "அவசர"],
  ["card", "කාඩ්", "அட்டை"],
  ["qr", "lankaqr"],
  ["business", "ව්‍යාපාර", "வணிகம்"],
];

function expand(query: string): string[] {
  const q = norm(query);
  const terms = new Set(q.split(/[\s,.?!]+/).filter((t) => t.length > 1));
  terms.add(q.trim());
  for (const group of SYNONYMS) if (group.some((g) => q.includes(norm(g)))) group.forEach((g) => terms.add(norm(g)));
  return [...terms];
}

export interface KnowledgeHit {
  entry: KnowledgeEntry;
  score: number;
}

/** Keyword retrieval over the verified knowledge base. */
export function searchKnowledge(entries: KnowledgeEntry[], query: string, limit = 3): KnowledgeHit[] {
  const q = norm(query);
  const terms = expand(query);
  return entries
    .map((entry) => {
      let score = 0;
      for (const kw of entry.keywords) {
        const k = norm(kw);
        if (q.includes(k)) score += 3 + k.split(" ").length; // phrase match in the question
        else if (terms.some((t) => t.length > 2 && k.includes(t))) score += 1;
      }
      for (const lang of ["en", "si", "ta"] as Lang[]) if (norm(entry.question[lang]) === q) score += 10;
      return { entry, score };
    })
    .filter((h) => h.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export interface LessonHit {
  course: Course;
  lesson: Lesson;
  score: number;
}

/** Multilingual lesson search across titles, summaries and tags. */
export function searchLessons(courses: Course[], query: string): LessonHit[] {
  const terms = expand(query);
  if (!query.trim()) return [];
  const hits: LessonHit[] = [];
  for (const course of courses) {
    for (const lesson of course.lessons) {
      const hay = norm(
        [lesson.title.en, lesson.title.si, lesson.title.ta, lesson.summary.en, lesson.summary.si, lesson.summary.ta, course.title.en, course.title.si, course.title.ta, ...lesson.tags].join(" "),
      );
      const score = terms.reduce((a, t) => a + (hay.includes(t) ? (t.length > 3 ? 2 : 1) : 0), 0);
      if (score > 0) hits.push({ course, lesson, score });
    }
  }
  return hits.sort((a, b) => b.score - a.score);
}
