import "./polyfills";
import sqlWasmUrl from "sql.js/dist/sql-wasm-browser.wasm?url";
import { run } from "./engine";
import { configureSqlJs } from "./database";
import { stdlib } from "./stdlib";
import { tmSeedSql, tmTableFiles } from "./tm-db";
import type { RunRequest, RunResponse } from "./protocol";

configureSqlJs({ locateFile: () => sqlWasmUrl });

const library = [...stdlib, ...tmTableFiles];

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, userFiles, testFiles } = event.data;
  let response: RunResponse;
  try {
    response = { id, result: await run(userFiles, library, testFiles, { seedSql: tmSeedSql }) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    response = { id, result: { ok: false, output: "", diagnostics: [], runtimeError: "Internal error: " + message, durationMs: 0 } };
  }
  self.postMessage(response);
};
