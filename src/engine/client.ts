import type { IFile, RunResult } from "./engine";
import type { RunRequest, RunResponse } from "./protocol";

const TIMEOUT_MS = 10_000;

let worker: Worker | undefined;
let nextId = 1;

function getWorker(): Worker {
  worker ??= new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  return worker;
}

/** Compiles and runs ABAP in a Web Worker; a run that exceeds the timeout (e.g. an endless loop) is killed. */
export function runAbap(userFiles: IFile[], testFiles: IFile[] = []): Promise<RunResult> {
  const w = getWorker();
  const id = nextId++;
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      w.terminate();
      worker = undefined;
      resolve({ ok: false, output: "", diagnostics: [], durationMs: TIMEOUT_MS,
        runtimeError: `Stopped after ${TIMEOUT_MS / 1000} seconds. Is there an endless loop?` });
    }, TIMEOUT_MS);
    const onMessage = (event: MessageEvent<RunResponse>) => {
      if (event.data.id !== id) return;
      clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      resolve(event.data.result);
    };
    w.addEventListener("message", onMessage);
    w.postMessage({ id, userFiles, testFiles } satisfies RunRequest);
  });
}

/** Loads the transpiler in the background so the first run is fast. */
export function warmUp(): void {
  getWorker();
}
