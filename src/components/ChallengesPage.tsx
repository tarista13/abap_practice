import { useState } from "react";
import { ChallengeView } from "./ChallengeView";
import { challenges } from "../challenges";
import { load, save } from "../storage";

const solvedKey = (id: string) => `challenge.${id}.solved`;

export function ChallengesPage({ challengeId, dark }: { challengeId?: string; dark: boolean }) {
  const challenge = challenges.find(c => c.id === challengeId) ?? challenges[0];
  const [solved, setSolved] = useState(() => new Set(challenges.filter(c => load(solvedKey(c.id))).map(c => c.id)));

  const markSolved = (id: string) => {
    save(solvedKey(id), "true");
    setSolved(prev => new Set(prev).add(id));
  };

  return (
    <div className="split">
      <nav className="sidebar" aria-label="Challenges">
        <h2>Challenges</h2>
        <ol>
          {challenges.map(c => (
            <li key={c.id}>
              <a href={`#/challenges/${c.id}`} className={c.id === challenge.id ? "active" : ""}>
                <span>
                  {c.title}
                  <span className="level">{c.level}</span>
                </span>
                {solved.has(c.id) && <span className="done" aria-label="solved">✓</span>}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="content no-scroll">
        <ChallengeView key={challenge.id} challenge={challenge} dark={dark} onSolved={() => markSolved(challenge.id)} />
      </div>
    </div>
  );
}
