// Checks the learning content with the real engine in Node:
// every playground sample must run cleanly, every challenge's solution must pass
// all of its tests, and its starter code must not.
// Usage: npm run check
import { readdirSync, readFileSync } from "node:fs";
import { run as runEngine, type IFile } from "../src/engine/engine.ts";
import { tmSeedSql, tmTableFiles } from "../src/engine/tm-db.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

// same library and database as the browser worker
const stdlib = [
  ...readdirSync(new URL("../src/engine/stdlib", import.meta.url))
    .map(filename => ({ filename, contents: read(`../src/engine/stdlib/${filename}`) })),
  ...tmTableFiles,
];
const run = (userFiles: IFile[], library: IFile[], testFiles: IFile[] = []) =>
  runEngine(userFiles, library, testFiles, { seedSql: tmSeedSql });

let failures = 0;
const report = (ok: boolean, label: string, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `\n      ${detail}` : ""}`);
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

console.log(failures ? `\n${failures} check(s) failed` : "\nAll content checks passed");
process.exit(failures ? 1 : 0);
