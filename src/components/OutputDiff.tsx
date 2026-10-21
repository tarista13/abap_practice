import { normalizeOutput } from "../tutorials/parse";

interface Props {
  expected: string;
  actual: string;
  /** label for the learner's side, e.g. "Your output" or "Your guess" */
  actualLabel: string;
  expectedLabel?: string;
}

/** Line-by-line comparison of expected and actual output; mismatching lines are marked. */
export function OutputDiff({ expected, actual, actualLabel, expectedLabel = "Expected" }: Props) {
  const exp = normalizeOutput(expected).split("\n");
  const act = normalizeOutput(actual).split("\n");
  const rows = Math.max(exp.length, act.length);
  return (
    <table className="diff">
      <thead>
        <tr><th /><th>{expectedLabel}</th><th>{actualLabel}</th></tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, i) => {
          const ok = exp[i] === act[i];
          return (
            <tr key={i} className={ok ? "same" : "differs"}>
              <td className="mark">{ok ? "✓" : "✗"}</td>
              <td><code>{exp[i] ?? ""}</code></td>
              <td><code>{act[i] ?? <span className="muted">(missing line)</span>}</code></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
