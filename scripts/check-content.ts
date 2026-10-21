// Checks the learning content with the real engine in Node:
// every playground sample and lesson example must run cleanly, every challenge's solution
// must pass all of its tests while its starter code must not, and every step of a lesson
// exercise must be solved by its solution but not by the code from the step before.
// Usage: npm run check
import { readdirSync, readFileSync } from "node:fs";
import { run as runEngine, type IFile, type RunResult } from "../src/engine/engine.ts";
import { tmSeedSql, tmTableFiles } from "../src/engine/tm-db.ts";
import { normalizeOutput, parseLesson, unmetRequirements, type Step } from "../src/tutorials/parse.ts";

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
    const label = `lesson ${lesson.id}: block ${n} (${block.kind})`;
    if (block.kind === "example" || block.kind === "predict") {
      const r = await snippet(block.code);
      report(r.ok, `${label} runs`, problems(r));
      if (verbose) console.log(r.output.replace(/^/gm, "      | "));
      continue;
    }

    // a step passes when the output matches and the code meets the step's requirements
    const passes = async (code: string, step: Step) => {
      const r = await snippet(code);
      return r.ok && normalizeOutput(r.output) === normalizeOutput(step.expected) &&
        unmetRequirements(code, step.requires).length === 0;
    };
    const starter = await snippet(block.starter);
    report(starter.diagnostics.length === 0, `${label} starter compiles`, problems(starter));

    let previous = block.starter;
    for (const [i, step] of block.steps.entries()) {
      const r = await snippet(step.solution);
      const output = normalizeOutput(r.output);
      const unmet = unmetRequirements(step.solution, step.requires);
      report(r.ok && output === normalizeOutput(step.expected) && unmet.length === 0,
        `${label} step ${i + 1}: solution passes`,
        problems(r) || (unmet.length ? `unmet: ${unmet.join("; ")}` : `got:\n${output.replace(/^/gm, "        ")}`));
      report(!(await passes(previous, step)), `${label} step ${i + 1}: previous code does not already pass`);
      report(step.hints.length > 0, `${label} step ${i + 1}: has a hint`);
      previous = step.solution;
    }
  }
}

console.log(failures ? `\n${failures} check(s) failed` : "\nAll content checks passed");
process.exit(failures ? 1 : 0);
