// Lessons are Markdown files. ABAP code fences become interactive blocks:
//
//   ```abap            a runnable example
//
//   ```abap predict    "what does this print?": the learner types a guess, then runs it
//     <code>
//     --- explain ---       (optional) shown after checking
//     <markdown>
//
//   ```abap steps      an exercise the learner builds up step by step
//     <starter code>        (may be empty)
//     --- step ---
//     <instruction, markdown>
//     --- expected ---
//     <expected output of the whole program after this step>
//     --- requires ---      (optional) one "regex :: message" per line, "!regex" must NOT match
//     --- hint ---          (optional, repeatable) revealed one at a time
//     --- solution ---
//     <the whole program after this step>
//     --- step ---
//     ...

export interface Requirement {
  pattern: string;
  negate: boolean;
  message: string;
}

export interface Step {
  instruction: string;
  expected: string;
  requires: Requirement[];
  hints: string[];
  solution: string;
}

export type LessonBlock =
  | { kind: "markdown"; text: string }
  | { kind: "example"; code: string }
  | { kind: "predict"; code: string; explain: string }
  | { kind: "steps"; starter: string; steps: Step[] };

export interface Lesson {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

const FENCE = /^```abap(?: (predict|steps))?[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;
const SECTION = /^--- (step|expected|requires|hint|solution|explain) ---[ \t]*\r?\n/m;

/** Splits a block body into its leading text and the "--- name ---" sections that follow. */
function sections(body: string): { head: string; parts: { name: string; text: string }[] } {
  // split with a capture group yields [head, name1, text1, name2, text2, ...]
  const chunks = body.split(SECTION);
  const parts = [];
  for (let i = 1; i < chunks.length; i += 2) {
    parts.push({ name: chunks[i], text: chunks[i + 1].trimEnd() });
  }
  return { head: chunks[0].trimEnd(), parts };
}

function parseRequirement(line: string, where: string): Requirement {
  const [pattern, message] = line.split(" :: ");
  if (!message) throw new Error(`${where}: requirement "${line}" needs " :: <message>"`);
  const negate = pattern.startsWith("!");
  const regex = (negate ? pattern.slice(1) : pattern).trim();
  new RegExp(regex); // fail early on a broken pattern
  return { pattern: regex, negate, message: message.trim() };
}

function parseSteps(body: string, where: string): LessonBlock {
  const { head, parts } = sections(body);
  const steps: Step[] = [];
  for (const { name, text } of parts) {
    if (name === "step") {
      steps.push({ instruction: text.trim(), expected: "", requires: [], hints: [], solution: "" });
      continue;
    }
    const step = steps.at(-1);
    if (!step) throw new Error(`${where}: "--- ${name} ---" before the first "--- step ---"`);
    if (name === "expected") step.expected = text.trim();
    else if (name === "solution") step.solution = text;
    else if (name === "hint") step.hints.push(text.trim());
    else if (name === "requires") {
      step.requires.push(...text.split(/\r?\n/).filter(l => l.trim()).map(l => parseRequirement(l, where)));
    } else throw new Error(`${where}: unexpected "--- ${name} ---" in a steps exercise`);
  }
  if (steps.length === 0) throw new Error(`${where}: a steps exercise needs at least one "--- step ---"`);
  steps.forEach((s, i) => {
    if (!s.expected || !s.solution) throw new Error(`${where}: step ${i + 1} needs "--- expected ---" and "--- solution ---"`);
  });
  return { kind: "steps", starter: head, steps };
}

function parsePredict(body: string, where: string): LessonBlock {
  const { head, parts } = sections(body);
  if (parts.some(p => p.name !== "explain")) throw new Error(`${where}: a predict block only allows "--- explain ---"`);
  return { kind: "predict", code: head, explain: parts[0]?.text.trim() ?? "" };
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
    const where = `Lesson ${id}, line ${body.slice(0, m.index).split("\n").length + 1}`;
    if (m[1] === "steps") blocks.push(parseSteps(code, where));
    else if (m[1] === "predict") blocks.push(parsePredict(code, where));
    else blocks.push({ kind: "example", code });
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

/** Returns the messages of the requirements the code does not meet. */
export function unmetRequirements(code: string, requires: Requirement[]): string[] {
  return requires
    .filter(r => new RegExp(r.pattern, "im").test(code) === r.negate)
    .map(r => r.message);
}
