// Compiles ABAP to JavaScript with the abaplint transpiler and runs it.
// Environment-agnostic: works in a Web Worker and in Node (for tests).
import * as abaplint from "@abaplint/core";
import { Transpiler, config as transpilerConfig, type IFile, type IOutputFile } from "@abaplint/transpiler";
import { ABAP, MemoryConsole } from "@abaplint/runtime";
import { connectDatabase } from "./database.ts";

export type { IFile };

export interface RunOptions {
  /** SQL INSERT statements filling the database tables defined in the library files */
  seedSql?: string[];
}

export interface Diagnostic {
  filename: string;
  message: string;
  row: number;
  col: number;
  endRow: number;
  endCol: number;
}

export interface TestResult {
  className: string;
  method: string;
  passed: boolean;
  message?: string;
}

export interface RunResult {
  ok: boolean;
  output: string;
  diagnostics: Diagnostic[];
  runtimeError?: string;
  tests?: TestResult[];
  durationMs: number;
}

/** Runs the abaplint checks the transpiler requires, returning issues for the given files only. */
export function check(files: IFile[], reportFor: Set<string>): Diagnostic[] {
  const conf = JSON.parse(JSON.stringify(transpilerConfig));
  conf.syntax.version = abaplint.Version.OpenABAP;
  conf.syntax.errorNamespace = ".";
  conf.rules.check_syntax = true;
  conf.rules.forbidden_identifier = { check: ["^unique\\d+$"] };
  const reg = new abaplint.Registry(new abaplint.Config(JSON.stringify(conf)));
  for (const f of files) {
    reg.addFile(new abaplint.MemoryFile(f.filename, f.contents));
  }
  return reg.findIssues()
    .filter(i => reportFor.has(i.getFilename()))
    .map(i => ({
      filename: i.getFilename(),
      // drop abaplint's internal lookup hints, e.g. "x" not found, findTop
      message: i.getMessage().replace(/, find\w+$/, ""),
      row: i.getStart().getRow(),
      col: i.getStart().getCol(),
      endRow: i.getEnd().getRow(),
      endCol: i.getEnd().getCol(),
    }));
}

// global class definitions must run before the classes that inherit from them
function orderChunks(objects: IOutputFile[]): IOutputFile[] {
  const byFile = new Map(objects.map(o => [o.filename, o]));
  const done = new Set<string>();
  const result: IOutputFile[] = [];
  const visit = (o: IOutputFile) => {
    if (done.has(o.filename)) return;
    done.add(o.filename);
    for (const r of o.requires) {
      const dep = byFile.get(r.filename.replace(/\.abap$/, ".mjs"));
      if (dep) visit(dep);
    }
    result.push(o);
  };
  objects.forEach(visit);
  return result;
}

const AsyncFunction = Object.getPrototypeOf(async function () { /* */ }).constructor;

function describeError(e: unknown): string {
  const anyE = e as any;
  if (anyE && typeof anyE === "object" && anyE.constructor?.INTERNAL_NAME) {
    const name = anyE.constructor.INTERNAL_NAME as string;
    const text = anyE.msg?.get?.() ?? "";
    return text ? `${name}: ${text}` : `Uncaught exception ${name}`;
  }
  if (e instanceof ReferenceError) {
    // the transpiler does not always emit inline declarations made at program level
    const name = /^(\w+) is not defined/.exec(e.message)?.[1];
    if (name) {
      return `Variable "${name}" was not declared. Inline declarations like DATA(${name}) are not ` +
        `fully supported outside of methods here, declare it with DATA ${name} TYPE ... first.`;
    }
  }
  return e instanceof Error ? e.message : String(e);
}

async function failureMessage(e: unknown): Promise<string> {
  const anyE = e as any;
  if (typeof anyE?.get_text === "function") {
    try {
      const text = (await anyE.get_text()).get();
      const name = anyE.constructor?.INTERNAL_NAME;
      return name === "CX_AUNIT_FAILURE" ? text : `${name}: ${text}`;
    } catch { /* fall through */ }
  }
  return describeError(e);
}

/**
 * Compiles and runs the files. `userFiles` are checked and reported on, `libraryFiles` are
 * trusted support code (stdlib, hidden tests). Test classes found in `testFiles` are executed
 * as ABAP Unit; otherwise the program in the user files is executed.
 */
export async function run(userFiles: IFile[], libraryFiles: IFile[], testFiles: IFile[] = [], options: RunOptions = {}): Promise<RunResult> {
  const start = performance.now();
  const all = [...libraryFiles, ...userFiles, ...testFiles];
  const finish = (r: Omit<RunResult, "durationMs">): RunResult => ({ ...r, durationMs: Math.round(performance.now() - start) });

  const diagnostics = check(all, new Set([...userFiles, ...testFiles].map(f => f.filename)));
  if (diagnostics.length > 0) {
    return finish({ ok: false, output: "", diagnostics });
  }

  let objects: IOutputFile[];
  let schema: string[];
  try {
    const out = await new Transpiler({ ignoreSourceMap: true }).runRaw(all);
    objects = orderChunks(out.objects);
    schema = out.databaseSetup.schemas.sqlite;
  } catch (e) {
    return finish({ ok: false, output: "", diagnostics: [], runtimeError: "Compile error: " + describeError(e) });
  }

  const console = new MemoryConsole();
  (globalThis as any).abap = new ABAP({ console });

  if (schema.length > 0) {
    try {
      await connectDatabase(schema, options.seedSql ?? []);
    } catch (e) {
      return finish({ ok: false, output: "", diagnostics: [], runtimeError: "Database setup failed: " + describeError(e) });
    }
  }

  const testNames = new Set(testFiles.map(f => f.filename.replace(/\.abap$/, ".mjs")));
  const testClasses: { className: string; cls: any; methods: string[] }[] = [];
  const g = globalThis as any;
  try {
    for (const o of objects) {
      // chunks are ES modules that refer to each other's exports by name; run each one as a
      // function body and publish its exports as globals so later chunks can resolve them
      const exports = o.exports.map(e => `${e}: ${e}`).join(", ");
      const mod = await new AsyncFunction(o.chunk.getCode() + `\nreturn { ${exports} };`)();
      if (testNames.has(o.filename)) {
        for (const name of o.exports) {
          const methods = Object.entries<any>(mod[name].METHODS ?? {})
            .filter(([m]) => !["SETUP", "TEARDOWN", "CLASS_SETUP", "CLASS_TEARDOWN"].includes(m))
            .map(([m]) => m.toLowerCase());
          testClasses.push({ className: name, cls: mod[name], methods });
        }
      } else {
        Object.assign(g, mod);
      }
    }
  } catch (e) {
    return finish({ ok: false, output: console.get(), diagnostics: [], runtimeError: describeError(e) });
  }

  if (testFiles.length === 0) {
    return finish({ ok: true, output: console.get(), diagnostics: [] });
  }

  const tests: TestResult[] = [];
  for (const { className, cls, methods } of testClasses) {
    for (const method of methods) {
      try {
        if (cls.class_setup) await cls.class_setup();
        const inst = await new cls().constructor_();
        const fa = inst.FRIENDS_ACCESS_INSTANCE;
        if (fa.setup) await fa.setup();
        await fa[method]();
        if (fa.teardown) await fa.teardown();
        tests.push({ className, method, passed: true });
      } catch (e) {
        tests.push({ className, method, passed: false, message: await failureMessage(e) });
      }
    }
  }
  return finish({ ok: tests.every(t => t.passed), output: console.get(), diagnostics: [], tests });
}
