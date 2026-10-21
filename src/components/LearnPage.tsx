import { useEffect, useRef, useState } from "react";
import { LessonView } from "./LessonView";
import { lessonProgress, lessons } from "../tutorials";

export function LearnPage({ lessonId, dark }: { lessonId: string; dark: boolean }) {
  const index = Math.max(0, lessons.findIndex(l => l.id === lessonId));
  const lesson = lessons[index];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  // progress lives in localStorage; bump this to re-read it after an exercise is finished
  const [, setVersion] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [lesson.id]);

  return (
    <div className="split">
      <nav className="sidebar" aria-label="Lessons">
        <h2>ABAP basics</h2>
        <ol>
          {lessons.map(l => {
            const { done, total } = lessonProgress(l);
            return (
              <li key={l.id}>
                <a href={`#/learn/${l.id}`} className={l.id === lesson.id ? "active" : ""}>
                  <span>{l.title}</span>
                  {total > 0 && (done === total
                    ? <span className="done" aria-label="all exercises done">✓</span>
                    : <span className="count" aria-label={`${done} of ${total} exercises done`}>{done}/{total}</span>)}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="content" ref={contentRef}>
        <LessonView key={lesson.id} lesson={lesson} dark={dark} onExerciseComplete={() => setVersion(v => v + 1)} />
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
