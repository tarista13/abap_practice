import { useState } from "react";
import { AbapEditor } from "./AbapEditor";
import { ResultPanel } from "./ResultPanel";
import { runAbap } from "../engine/client";
import type { RunResult } from "../engine/engine";
import { normalizeOutput } from "../tutorials/parse";
import { load, save } from "../storage";

interface Exercise {
  solution: string;
  expected: string;
}

interface Props {
  /** localStorage key for the learner's edits */
  storageKey: string;
  initialCode: string;
  dark: boolean;
  /** when given, the output is checked against the expected output */
  exercise?: Exercise;
  onSolved?: () => void;
}

/** A small editor embedded in a lesson, with its own Run button and output. */
export function CodeRunner({ storageKey, initialCode, dark, exercise, onSolved }: Props) {
  const [code, setCode] = useState(() => load(storageKey) ?? initialCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState<boolean | null>(null);
  const [showExpected, setShowExpected] = useState(false);

  const update = (value: string) => {
    setCode(value);
    save(storageKey, value);
  };

  const run = async () => {
    if (running) return;
    setRunning(true);
    const r = await runAbap([{ filename: "zsnippet.prog.abap", contents: code }]);
    setResult(r);
    if (exercise) {
      const ok = r.ok && normalizeOutput(r.output) === normalizeOutput(exercise.expected);
      setSolved(ok);
      if (ok) onSolved?.();
    }
    setRunning(false);
  };

  const replace = (text: string) => {
    update(text);
    setResult(null);
    setSolved(null);
  };

  const modified = code !== initialCode;

  return (
    <div className={`runner ${exercise ? "exercise" : ""}`}>
      {exercise && <div className="runner-label">Exercise</div>}
      <div className="runner-editor">
        <AbapEditor value={code} onChange={update} diagnostics={result?.diagnostics ?? []} onRun={run} dark={dark} autoHeight />
      </div>
      <div className="runner-toolbar">
        <button className="primary" onClick={run} disabled={running}>▶ Run</button>
        {modified && <button onClick={() => replace(initialCode)}>Reset</button>}
        {exercise && <button onClick={() => setShowExpected(s => !s)}>{showExpected ? "Hide" : "Show"} expected output</button>}
        {exercise && <button onClick={() => replace(exercise.solution)}>Show solution</button>}
        <span className="spacer" />
        <span className="hint">Ctrl+Enter</span>
      </div>
      {exercise && showExpected && (
        <div className="runner-expected">
          <h3>Expected output</h3>
          <pre className="output">{exercise.expected}</pre>
        </div>
      )}
      {exercise && solved !== null && (
        <div className={`runner-verdict ${solved ? "good" : "bad"}`}>
          {solved ? "✓ Correct, well done!" : "✗ Not quite. Compare your output with the expected output."}
        </div>
      )}
      {(result || running) && (
        <div className="runner-result">
          <ResultPanel result={result} running={running} emptyText="" />
        </div>
      )}
    </div>
  );
}
