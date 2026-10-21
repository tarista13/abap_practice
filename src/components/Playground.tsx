import { useState } from "react";
import { AbapEditor } from "./AbapEditor";
import { ResultPanel } from "./ResultPanel";
import { TableBrowser } from "./TableBrowser";
import { runAbap } from "../engine/client";
import type { RunResult } from "../engine/engine";
import { samples } from "../samples";
import { load, save } from "../storage";

const STORAGE_KEY = "playground.code";

export function Playground({ dark }: { dark: boolean }) {
  const [code, setCode] = useState(() => load(STORAGE_KEY) ?? samples[0].code);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [showTables, setShowTables] = useState(false);

  const update = (value: string) => {
    setCode(value);
    save(STORAGE_KEY, value);
  };

  const run = async (source: string = code) => {
    if (running) return;
    setRunning(true);
    setShowTables(false);
    // a program is a PROG object whose name must match its REPORT statement
    const name = /^\s*REPORT\s+(\w+)/im.exec(source)?.[1]?.toLowerCase() ?? "zplayground";
    setResult(await runAbap([{ filename: `${name}.prog.abap`, contents: source }]));
    setRunning(false);
  };

  return (
    <div className="workspace">
      <div className="pane editor-pane">
        <div className="toolbar">
          <select
            aria-label="Load an example"
            value=""
            onChange={e => {
              const sample = samples.find(s => s.id === e.target.value);
              if (sample) { update(sample.code); setResult(null); }
            }}
          >
            <option value="" disabled>Load an example…</option>
            {samples.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <button className={showTables ? "active" : ""} aria-pressed={showTables} onClick={() => setShowTables(s => !s)}>
            Tables
          </button>
          <span className="spacer" />
          <span className="hint">Ctrl+Enter</span>
          <button className="primary" onClick={() => run()} disabled={running}>▶ Run</button>
        </div>
        <div className="editor">
          <AbapEditor value={code} onChange={update} diagnostics={result?.diagnostics ?? []} onRun={run} dark={dark} />
        </div>
      </div>
      <div className="pane result-pane">
        {showTables
          ? <TableBrowser />
          : <ResultPanel result={result} running={running} emptyText="Write some ABAP and press Run. WRITE statements show up here." />}
      </div>
    </div>
  );
}
