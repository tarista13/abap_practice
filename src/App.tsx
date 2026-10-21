import { useEffect, useState } from "react";
import { Playground } from "./components/Playground";
import { ChallengeView } from "./components/ChallengeView";
import { challenges } from "./challenges";
import { warmUp } from "./engine/client";
import { load, save } from "./storage";

type Tab = { kind: "playground" } | { kind: "challenge"; id: string };

const solvedKey = (id: string) => `challenge.${id}.solved`;

function usePrefersDark(): boolean {
  const query = "(prefers-color-scheme: dark)";
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return dark;
}

export default function App() {
  const [tab, setTab] = useState<Tab>({ kind: "playground" });
  const [solved, setSolved] = useState(() => new Set(challenges.filter(c => load(solvedKey(c.id))).map(c => c.id)));
  const dark = usePrefersDark();

  // start loading the transpiler before the first Run
  useEffect(() => warmUp(), []);

  const challenge = tab.kind === "challenge" ? challenges.find(c => c.id === tab.id) : undefined;

  const markSolved = (id: string) => {
    save(solvedKey(id), "true");
    setSolved(prev => new Set(prev).add(id));
  };

  return (
    <div className="app">
      <header>
        <h1>ABAP Practice <span className="sub">for SAP TM</span></h1>
        <nav>
          <button className={tab.kind === "playground" ? "active" : ""} onClick={() => setTab({ kind: "playground" })}>
            Playground
          </button>
          {challenges.map(c => (
            <button
              key={c.id}
              className={tab.kind === "challenge" && tab.id === c.id ? "active" : ""}
              onClick={() => setTab({ kind: "challenge", id: c.id })}
            >
              Challenge: {c.title}{solved.has(c.id) ? " ✓" : ""}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab.kind === "playground" && <Playground dark={dark} />}
        {challenge && (
          <ChallengeView key={challenge.id} challenge={challenge} dark={dark} onSolved={() => markSolved(challenge.id)} />
        )}
      </main>
    </div>
  );
}
