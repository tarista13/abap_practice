import type { RunResult } from "../engine/engine";

interface Props {
  result: RunResult | null;
  running: boolean;
  emptyText: string;
}

export function ResultPanel({ result, running, emptyText }: Props) {
  if (running) {
    return <div className="result muted">Compiling and running…</div>;
  }
  if (!result) {
    return <div className="result muted">{emptyText}</div>;
  }

  const passed = result.tests?.filter(t => t.passed).length ?? 0;
  const showOutput = result.output !== "" ||
    (!result.tests && result.diagnostics.length === 0 && !result.runtimeError);
  return (
    <div className="result">
      {result.diagnostics.length > 0 && (
        <section>
          <h3 className="bad">Syntax errors</h3>
          <ul className="diagnostics">
            {result.diagnostics.map((d, i) => (
              <li key={i}><span className="loc">Line {d.row}, col {d.col}</span> {d.message}</li>
            ))}
          </ul>
        </section>
      )}

      {result.tests && (
        <section>
          <h3 className={result.ok ? "good" : "bad"}>
            {result.ok ? "All tests passed" : `${passed} of ${result.tests.length} tests passed`}
          </h3>
          <ul className="tests">
            {result.tests.map(t => (
              <li key={t.className + t.method} className={t.passed ? "pass" : "fail"}>
                <span className="mark">{t.passed ? "✓" : "✗"}</span>
                <div>
                  <code>{t.method}</code>
                  {t.message && <div className="message">{t.message}</div>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.runtimeError && (
        <section>
          <h3 className="bad">Runtime error</h3>
          <pre className="error">{result.runtimeError}</pre>
        </section>
      )}

      {showOutput && (
        <section>
          <h3>Output</h3>
          <pre className="output">{result.output || "(no output)"}</pre>
        </section>
      )}

      <div className="muted small">Finished in {result.durationMs} ms</div>
    </div>
  );
}
