// Lessons are Markdown files. ABAP code fences become interactive blocks:
//
//   ```abap            a runnable example
//   ```abap exercise   an exercise, written as
//                        <starter code>
//                        --- solution ---
//                        <solution code>
//                        --- expected ---
//                        <expected output>

export type LessonBlock =
  | { kind: "markdown"; text: string }
  | { kind: "example"; code: string }
  | { kind: "exercise"; starter: string; solution: string; expected: string };

export interface Lesson {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

const FENCE = /^```abap( exercise)?[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;

function parseExercise(body: string, lessonId: string): LessonBlock {
  const parts = body.split(/^--- (solution|expected) ---[ \t]*\r?\n/m);
  // split with a capture group yields [starter, "solution", solution, "expected", expected]
  if (parts.length !== 5 || parts[1] !== "solution" || parts[3] !== "expected") {
    throw new Error(`Lesson ${lessonId}: an exercise needs "--- solution ---" and "--- expected ---" sections`);
  }
  return { kind: "exercise", starter: parts[0].trimEnd(), solution: parts[2].trimEnd(), expected: parts[4].trimEnd() };
}

/** Parses a lesson file. `filename` like "02-variables.md" gives the id "variables". */
export function parseLesson(filename: string, source: string): Lesson {
  const id = filename.replace(/^.*\//, "").replace(/\.md$/, "").replace(/^\d+-/, "");
  const title = /^#\s+(.+)$/m.exec(source)?.[1].trim();
  if (!title) throw new Error(`Lesson ${id}: missing "# Title" line`);
  const body = source.replace(/^#\s+.+\r?\n/m, "");

  const blocks: LessonBlock[] = [];
  let last = 0;
  for (const m of body.matchAll(FENCE)) {
    const text = body.slice(last, m.index).trim();
    if (text) blocks.push({ kind: "markdown", text });
    const code = m[2].trimEnd();
    blocks.push(m[1] ? parseExercise(code, id) : { kind: "example", code });
    last = m.index + m[0].length;
  }
  const rest = body.slice(last).trim();
  if (rest) blocks.push({ kind: "markdown", text: rest });
  return { id, title, blocks };
}

/** Normalizes program output for comparing it with an exercise's expected output. */
export function normalizeOutput(text: string): string {
  return text.split(/\r?\n/).map(l => l.trimEnd()).join("\n").trim();
}
