import { useState } from "react";
import { AbapEditor } from "./AbapEditor";
import { Markdown } from "./Markdown";
import { OutputDiff } from "./OutputDiff";
import { ResultPanel } from "./ResultPanel";
import { runAbap } from "../engine/client";
import type { RunResult } from "../engine/engine";
import { normalizeOutput, unmetRequirements, type Step } from "../tutorials/parse";
import { load, save } from "../storage";

interface Props {
  /** prefix for the localStorage keys of this exercise */
  storageKey: string;
  starter: string;
  steps: Step[];
  dark: boolean;
  onComplete: () => void;
}

type Feedback =
  | { kind: "passed"; step: number }
  | { kind: "requirements"; messages: string[] }
  | { kind: "mismatch"; expected: string; actual: string }
  | null;

// the solution is offered after all hints or this many wrong attempts on a step
const ATTEMPTS_BEFORE_SOLUTION = 2;

/** An exercise the learner builds up step by step; each step unlocks when its output is right. */
export function StepExercise({ storageKey, starter, steps, dark, onComplete }: Props) {
  const [code, setCode] = useState(() => load(`${storageKey}.code`) ?? starter);
  const [done, setDone] = useState(() => Math.min(Number(load(`${storageKey}.steps`) ?? 0), steps.length));
  const [hintsShown, setHintsShown] = useState(0);
  const [failed, setFailed] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const finished = done >= steps.length;
  const step = steps[Math.min(done, steps.length - 1)];

  const update = (value: string) => {
    setCode(value);
    save(`${storageKey}.code`, value);
  };

  const setStepsDone = (n: number) => {
    setDone(n);
    save(`${storageKey}.steps`, String(n));
    setHintsShown(0);
    setFailed(0);
  };

  const run = async (source: string = code) => {
    if (running) return;
    setRunning(true);
    setFeedback(null);
    const r = await runAbap([{ filename: "zexercise.prog.abap", contents: source }]);
    setResult(r);
    setRunning(false);
    if (!r.ok || finished) return;

    const unmet = unmetRequirements(source, step.requires);
    const outputMatches = normalizeOutput(r.output) === normalizeOutput(step.expected);
    if (outputMatches && unmet.length === 0) {
      setFeedback({ kind: "passed", step: done });
      setStepsDone(done + 1);
      if (done + 1 === steps.length) onComplete();
    } else {
      setFailed(f => f + 1);
      setFeedback(outputMatches
        ? { kind: "requirements", messages: unmet }
        : { kind: "mismatch", expected: step.expected, actual: r.output });
    }
  };

  const startOver = () => {
    if (!confirm("Start this exercise over from step 1? Your code will be replaced.")) return;
    update(starter);
    setStepsDone(0);
    setResult(null);
    setFeedback(null);
  };

  const showSolution = () => {
    update(step.solution);
    setFeedback(null);
    setResult(null);
  };

  const canShowSolution = !finished && (hintsShown >= step.hints.length || failed >= ATTEMPTS_BEFORE_SOLUTION);

  return (
    <div className="runner exercise steps-exercise">
      <div className="runner-label">
        <span>Exercise</span>
        <span className="progress" aria-label={`${done} of ${steps.length} steps done`}>
          {steps.map((_, i) => <span key={i} className={i < done ? "dot done" : i === done ? "dot current" : "dot"} />)}
          {finished ? "Complete" : `Step ${done + 1} of ${steps.length}`}
        </span>
      </div>

      <ol className="step-list">
        {steps.map((s, i) => i <= done && (
          <li key={i} className={i < done ? "step done" : "step current"}>
            <span className="step-mark">{i < done ? "✓" : i + 1}</span>
            <Markdown text={s.instruction} className="prose step-text" />
          </li>
        ))}
      </ol>
      {!finished && done + 1 < steps.length && (
        <div className="more-steps muted small">
          {steps.length - done - 1} more step{steps.length - done - 1 > 1 ? "s" : ""} after this one
        </div>
      )}

      {!finished && hintsShown > 0 && (
        <div className="hints">
          {step.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="hint">
              <strong>Hint {i + 1}:</strong> <Markdown text={h} className="prose hint-text" />
            </div>
          ))}
        </div>
      )}

      <div className="runner-editor">
        <AbapEditor
          value={code}
          onChange={update}
          diagnostics={result?.diagnostics ?? []}
          onRun={run}
          dark={dark}
          autoHeight
          minHeight={140}
        />
      </div>

      <div className="runner-toolbar">
        <button className="primary" onClick={() => run()} disabled={running}>▶ {finished ? "Run" : "Run & check"}</button>
        {!finished && hintsShown < step.hints.length && (
          <button onClick={() => setHintsShown(h => h + 1)}>
            {hintsShown === 0 ? "Hint" : "Another hint"} ({step.hints.length - hintsShown} left)
          </button>
        )}
        {canShowSolution && <button onClick={showSolution}>Show solution for this step</button>}
        <span className="spacer" />
        {(done > 0 || code !== starter) && <button onClick={startOver}>Start over</button>}
      </div>

      {feedback?.kind === "passed" && (
        <div className="runner-verdict good">
          {feedback.step + 1 === steps.length
            ? "✓ Exercise complete. Nicely done!"
            : `✓ Step ${feedback.step + 1} done. On to step ${feedback.step + 2}, see the new instruction above.`}
        </div>
      )}
      {feedback?.kind === "requirements" && (
        <div className="runner-verdict bad">
          The output is right, but:
          <ul>{feedback.messages.map(m => <li key={m}>{m}</li>)}</ul>
        </div>
      )}
      {feedback?.kind === "mismatch" && (
        <div className="runner-verdict bad">
          ✗ Not quite. The marked lines differ:
          <OutputDiff expected={feedback.expected} actual={feedback.actual} actualLabel="Your output" />
        </div>
      )}
      {(running || (result && (!result.ok || feedback?.kind !== "mismatch"))) && (
        <div className="runner-result">
          <ResultPanel result={result} running={running} emptyText="" />
        </div>
      )}
    </div>
  );
}
