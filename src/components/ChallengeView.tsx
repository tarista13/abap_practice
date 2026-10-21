import { useState, type ReactNode } from "react";
import { AbapEditor } from "./AbapEditor";
import { ResultPanel } from "./ResultPanel";
import { TableBrowser } from "./TableBrowser";
import { runAbap } from "../engine/client";
import type { RunResult } from "../engine/engine";
import type { Challenge } from "../challenges";
import { load, save } from "../storage";

function inline(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

function Description({ lines }: { lines: string[] }) {
  const blocks: ReactNode[] = [];
  let items: string[] = [];
  const flush = () => {
    if (items.length) blocks.push(<ul key={blocks.length}>{items.map((t, i) => <li key={i}>{inline(t)}</li>)}</ul>);
    items = [];
  };
  for (const line of lines) {
    if (line.startsWith("- ")) { items.push(line.slice(2)); continue; }
    flush();
    blocks.push(<p key={blocks.length}>{inline(line)}</p>);
  }
  flush();
  return <>{blocks}</>;
}

interface Props {
  challenge: Challenge;
  dark: boolean;
  onSolved: () => void;
}

export function ChallengeView({ challenge, dark, onSolved }: Props) {
  const storageKey = `challenge.${challenge.id}.code`;
  const [code, setCode] = useState(() => load(storageKey) ?? challenge.starter);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  const update = (value: string) => {
    setCode(value);
    save(storageKey, value);
  };

  const run = async (source: string = code) => {
    if (running) return;
    setRunning(true);
    const r = await runAbap(
      [{ filename: `${challenge.className}.clas.abap`, contents: source }],
      [{ filename: `${challenge.className}.clas.testclasses.abap`, contents: challenge.tests }],
    );
    setResult(r);
    if (r.ok) onSolved();
    setRunning(false);
  };

  const replaceWith = (text: string, question: string) => {
    if (confirm(question)) { update(text); setResult(null); }
  };

  return (
    <div className="workspace">
      <div className="pane brief-pane">
        <div className="brief">
          <div className="meta">
            <span className="badge">{challenge.level}</span>
            {challenge.topics.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <h2>{challenge.title}</h2>
          <Description lines={challenge.description} />
          {challenge.usesDatabase && (
            <details className="db-details">
              <summary>Database tables</summary>
              <TableBrowser />
            </details>
          )}
        </div>
        <ResultPanel result={result} running={running} emptyText="Test results appear here." />
      </div>
      <div className="pane editor-pane">
        <div className="toolbar">
          <button onClick={() => replaceWith(challenge.starter, "Replace your code with the starter code?")}>Reset</button>
          <button onClick={() => replaceWith(challenge.solution, "Replace your code with the sample solution?")}>Show solution</button>
          <span className="spacer" />
          <span className="hint">Ctrl+Enter</span>
          <button className="primary" onClick={() => run()} disabled={running}>▶ Run tests</button>
        </div>
        <div className="editor">
          <AbapEditor value={code} onChange={update} diagnostics={result?.diagnostics ?? []} onRun={run} dark={dark} />
        </div>
      </div>
    </div>
  );
}
