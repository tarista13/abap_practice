import { parseLesson, type Lesson } from "./parse";

export type { Lesson };

// lessons are ordered by their file name prefix, e.g. 01-first-program.md
const sources = import.meta.glob<string>("./lessons/*.md", { query: "?raw", import: "default", eager: true });

export const lessons: Lesson[] = Object.keys(sources)
  .sort()
  .map(path => parseLesson(path, sources[path]));
