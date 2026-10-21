// Checks the learning content with the real engine in Node:
// every playground sample and lesson example must run cleanly, every challenge's solution
// must pass all of its tests and every lesson exercise's solution must print the expected
// output, while their starter code must not.
// Usage: npm run check
import { readdirSync, readFileSync } from "node:fs";
import { run as runEngine, type IFile, type RunResult } from "../src/engine/engine.ts";
import { tmSeedSql, tmTableFiles } from "../src/engine/tm-db.ts";
import { normalizeOutput, parseLesson } from "../src/tutorials/parse.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

// same library and database as the browser worker
const stdlib = [
  ...readdirSync(new URL("../src/engine/stdlib", import.meta.url))
    .map(filename => ({ filename, contents: read(`../src/engine/stdlib/${filename}`) })),
  ...tmTableFiles,
];
const run = (userFiles: IFile[], library: IFile[], testFiles: IFile[] = []) =>
  runEngine(userFiles, library, testFiles, { seedSql: tmSeedSql });

// --verbose also prints the output of every lesson example
const verbose = process.argv.includes("--verbose");

let failures = 0;
const report = (ok: boolean, label: string, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${!ok && detail ? `\n      ${detail}` : ""}`);
  if (!ok) failures++;
};

for (const file of readdirSync(new URL("../src/samples", import.meta.url)).filter(f => f.endsWith(".abap"))) {
  const code = read(`../src/samples/${file}`);
  const name = /^\s*REPORT\s+(\w+)/im.exec(code)?.[1]?.toLowerCase() ?? "zsample";
  const r = await run([{ filename: `${name}.prog.abap`, contents: code }], stdlib);
  report(r.ok, `sample ${file}`, r.runtimeError ?? r.diagnostics.map(d => `line ${d.row}: ${d.message}`).join("; "));
}

for (const id of readdirSync(new URL("../src/challenges", import.meta.url), { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name)) {
  const dir = `../src/challenges/${id}`;
  const className = /^CLASS\s+(\w+)\s+DEFINITION/im.exec(read(`${dir}/starter.abap`))![1].toLowerCase();
  const tests = [{ filename: `${className}.clas.testclasses.abap`, contents: read(`${dir}/tests.abap`) }];
  const attempt = (file: string) => run([{ filename: `${className}.clas.abap`, contents: read(`${dir}/${file}`) }], stdlib, tests);

  const solution = await attempt("solution.abap");
  const failed = solution.tests?.filter(t => !t.passed).map(t => `${t.method}: ${t.message}`) ?? [];
  report(solution.ok, `challenge ${id}: solution passes`,
    solution.runtimeError ?? [...solution.diagnostics.map(d => `line ${d.row}: ${d.message}`), ...failed].join("; "));

  const starter = await attempt("starter.abap");
  report(starter.diagnostics.length === 0 && !starter.ok, `challenge ${id}: starter compiles and fails`,
    starter.diagnostics.map(d => `line ${d.row}: ${d.message}`).join("; "));
}

const problems = (r: RunResult) => r.runtimeError ?? r.diagnostics.map(d => `line ${d.row}: ${d.message}`).join("; ");
const snippet = (code: string) => run([{ filename: "zsnippet.prog.abap", contents: code }], stdlib);

for (const file of readdirSync(new URL("../src/tutorials/lessons", import.meta.url)).filter(f => f.endsWith(".md")).sort()) {
  const lesson = parseLesson(file, read(`../src/tutorials/lessons/${file}`));
  let n = 0;
  for (const block of lesson.blocks) {
    if (block.kind === "markdown") continue;
    n++;
    if (block.kind === "example") {
      const r = await snippet(block.code);
      report(r.ok, `lesson ${lesson.id}: example ${n} runs`, problems(r));
      if (verbose) console.log(r.output.replace(/^/gm, "      | "));
      continue;
    }
    const solution = await snippet(block.solution);
    const output = normalizeOutput(solution.output);
    report(solution.ok && output === normalizeOutput(block.expected), `lesson ${lesson.id}: exercise ${n} solution gives expected output`,
      problems(solution) || `got:\n${output}`);
    const starter = await snippet(block.starter);
    report(starter.diagnostics.length === 0 && normalizeOutput(starter.output) !== normalizeOutput(block.expected),
      `lesson ${lesson.id}: exercise ${n} starter compiles and is not already correct`, problems(starter));
  }
}

console.log(failures ? `\n${failures} check(s) failed` : "\nAll content checks passed");
process.exit(failures ? 1 : 0);
