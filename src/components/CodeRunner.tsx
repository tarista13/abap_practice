import { useState } from "react";
import { AbapEditor } from "./AbapEditor";
import { ResultPanel } from "./ResultPanel";
import { runAbap } from "../engine/client";
import type { RunResult } from "../engine/engine";
import { load, save } from "../storage";

interface Props {
  /** localStorage key for the learner's edits */
  storageKey: string;
  initialCode: string;
  dark: boolean;
}

/** A small editor embedded in a lesson, with its own Run button and output. */
export function CodeRunner({ storageKey, initialCode, dark }: Props) {
  const [code, setCode] = useState(() => load(storageKey) ?? initialCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  const update = (value: string) => {
    setCode(value);
    save(storageKey, value);
  };

  const run = async (source: string = code) => {
    if (running) return;
    setRunning(true);
    setResult(await runAbap([{ filename: "zsnippet.prog.abap", contents: source }]));
    setRunning(false);
  };

  return (
    <div className="runner">
      <div className="runner-editor">
        <AbapEditor value={code} onChange={update} diagnostics={result?.diagnostics ?? []} onRun={run} dark={dark} autoHeight />
      </div>
      <div className="runner-toolbar">
        <button className="primary" onClick={() => run()} disabled={running}>▶ Run</button>
        {code !== initialCode && <button onClick={() => { update(initialCode); setResult(null); }}>Reset</button>}
        <span className="spacer" />
        <span className="hint">Ctrl+Enter</span>
      </div>
      {(result || running) && (
        <div className="runner-result">
          <ResultPanel result={result} running={running} emptyText="" />
        </div>
      )}
    </div>
  );
}
