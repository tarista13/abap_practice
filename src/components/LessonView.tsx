import { useMemo } from "react";
import { marked } from "marked";
import { CodeRunner } from "./CodeRunner";
import type { Lesson } from "../tutorials";

interface Props {
  lesson: Lesson;
  dark: boolean;
  onExerciseSolved: (blockIndex: number) => void;
}

function Markdown({ text }: { text: string }) {
  // lesson text is our own content, so rendering its HTML is safe
  const html = useMemo(() => marked.parse(text, { async: false }), [text]);
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function LessonView({ lesson, dark, onExerciseSolved }: Props) {
  return (
    <article className="lesson">
      <h1>{lesson.title}</h1>
      {lesson.blocks.map((block, i) => {
        const storageKey = `lesson.${lesson.id}.${i}.code`;
        switch (block.kind) {
          case "markdown":
            return <Markdown key={i} text={block.text} />;
          case "example":
            return <CodeRunner key={i} storageKey={storageKey} initialCode={block.code} dark={dark} />;
          case "exercise":
            return (
              <CodeRunner
                key={i}
                storageKey={storageKey}
                initialCode={block.starter}
                dark={dark}
                exercise={block}
                onSolved={() => onExerciseSolved(i)}
              />
            );
        }
      })}
    </article>
  );
}
