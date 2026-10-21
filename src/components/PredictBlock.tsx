import { useId, useState } from "react";
import { AbapEditor } from "./AbapEditor";
import { Markdown } from "./Markdown";
import { OutputDiff } from "./OutputDiff";
import { runAbap } from "../engine/client";
import type { RunResult } from "../engine/engine";
import { normalizeOutput } from "../tutorials/parse";

interface Props {
  code: string;
  explain: string;
  dark: boolean;
}

/** Shows a program and asks the learner what it prints before running it. */
export function PredictBlock({ code, explain, dark }: Props) {
  const id = useId();
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  const check = async () => {
    if (running) return;
    setRunning(true);
    setResult(await runAbap([{ filename: "zpredict.prog.abap", contents: code }]));
    setRunning(false);
  };

  const actual = result ? (result.ok ? result.output : `Runtime error: ${result.runtimeError ?? "syntax error"}`) : "";
  const correct = result !== null && normalizeOutput(guess) === normalizeOutput(actual);

  return (
    <div className="runner predict">
      <div className="runner-label"><span>Predict the output</span></div>
      <div className="runner-editor">
        <AbapEditor value={code} onChange={() => {}} diagnostics={[]} onRun={check} dark={dark} autoHeight readOnly />
      </div>
      <div className="predict-guess">
        <label htmlFor={id}>What will this program print? One output line per line.</label>
        <textarea
          id={id}
          value={guess}
          onChange={e => { setGuess(e.target.value); setResult(null); }}
          rows={Math.max(3, guess.split("\n").length + 1)}
          spellCheck={false}
          placeholder="Type your prediction here"
        />
      </div>
      <div className="runner-toolbar">
        <button className="primary" onClick={check} disabled={running || guess.trim() === ""}>
          {running ? "Running…" : "Check my prediction"}
        </button>
        {guess.trim() === "" && <span className="hint">Make a guess first, even a rough one.</span>}
      </div>
      {result && (
        <div className={`runner-verdict ${correct ? "good" : "bad"}`}>
          {correct ? "✓ Exactly right!" : "✗ Not quite. Here's what it actually prints:"}
          {!correct && <OutputDiff expected={actual} actual={guess} expectedLabel="Actual output" actualLabel="Your guess" />}
          {explain && <Markdown text={explain} className="prose explain" />}
        </div>
      )}
    </div>
  );
}
