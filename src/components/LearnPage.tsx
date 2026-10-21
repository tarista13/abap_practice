import { useEffect, useRef, useState } from "react";
import { LessonView } from "./LessonView";
import { lessons } from "../tutorials";
import { load, save } from "../storage";

const solvedKey = (lessonId: string, block: number) => `lesson.${lessonId}.${block}.solved`;

function exerciseIndexes(lessonId: string): number[] {
  const lesson = lessons.find(l => l.id === lessonId)!;
  return lesson.blocks.flatMap((b, i) => (b.kind === "exercise" ? [i] : []));
}

function isComplete(lessonId: string): boolean {
  const exercises = exerciseIndexes(lessonId);
  return exercises.length > 0 && exercises.every(i => load(solvedKey(lessonId, i)));
}

export function LearnPage({ lessonId, dark }: { lessonId: string; dark: boolean }) {
  const index = Math.max(0, lessons.findIndex(l => l.id === lessonId));
  const lesson = lessons[index];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const [, setVersion] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [lesson.id]);

  const markSolved = (block: number) => {
    save(solvedKey(lesson.id, block), "true");
    setVersion(v => v + 1);
  };

  return (
    <div className="split">
      <nav className="sidebar" aria-label="Lessons">
        <h2>ABAP basics</h2>
        <ol>
          {lessons.map(l => (
            <li key={l.id}>
              <a href={`#/learn/${l.id}`} className={l.id === lesson.id ? "active" : ""}>
                <span>{l.title}</span>
                {isComplete(l.id) && <span className="done" aria-label="completed">✓</span>}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="content" ref={contentRef}>
        <LessonView key={lesson.id} lesson={lesson} dark={dark} onExerciseSolved={markSolved} />
        <div className="pager">
          {prev ? <a href={`#/learn/${prev.id}`}>← {prev.title}</a> : <span />}
          {next
            ? <a href={`#/learn/${next.id}`}>{next.title} →</a>
            : <a href="#/challenges">Try the challenges →</a>}
        </div>
      </div>
    </div>
  );
}
