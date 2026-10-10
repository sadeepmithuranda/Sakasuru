import type { Course, Lesson } from "./types.js";
import { level1 } from "./courses/level1-basics.js";
import { level2 } from "./courses/level2-managing.js";
import { level3 } from "./courses/level3-digital.js";
import { level4 } from "./courses/level4-investing.js";
import { level5 } from "./courses/level5-protecting.js";
import { level6, level7, level8 } from "./courses/level6-8.js";

export * from "./types.js";
export * from "./knowledge.js";
export * from "./gamification.js";
export * from "./search.js";

export const COURSES: Course[] = [level1, level2, level3, level4, level5, level6, level7, level8];

export const ALL_LESSONS: { course: Course; lesson: Lesson }[] = COURSES.flatMap((course) => course.lessons.map((lesson) => ({ course, lesson })));

export const findLesson = (slug: string) => ALL_LESSONS.find((x) => x.lesson.slug === slug);

export const PROTECTION_LESSONS = ALL_LESSONS.filter((x) => x.lesson.protection).map((x) => x.lesson.slug);
export * from "./learning.js";
