import { parseLesson, type Lesson } from "./parse";
import { load } from "../storage";

export type { Lesson };

// lessons are ordered by their file name prefix, e.g. 01-first-program.md
const sources = import.meta.glob<string>("./lessons/*.md", { query: "?raw", import: "default", eager: true });

export const lessons: Lesson[] = Object.keys(sources)
  .sort()
  .map(path => parseLesson(path, sources[path]));

/** localStorage key prefix of a lesson's exercise block */
export const exerciseKey = (lessonId: string, block: number) => `lesson.${lessonId}.${block}`;

/** Number of exercises in a lesson and how many of them are finished. */
export function lessonProgress(lesson: Lesson): { done: number; total: number } {
  let done = 0;
  let total = 0;
  lesson.blocks.forEach((b, i) => {
    if (b.kind !== "steps") return;
    total++;
    if (Number(load(`${exerciseKey(lesson.id, i)}.steps`) ?? 0) >= b.steps.length) done++;
  });
  return { done, total };
}
