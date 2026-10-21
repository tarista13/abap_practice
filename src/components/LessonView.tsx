import { CodeRunner } from "./CodeRunner";
import { Markdown } from "./Markdown";
import { PredictBlock } from "./PredictBlock";
import { StepExercise } from "./StepExercise";
import { exerciseKey, type Lesson } from "../tutorials";

interface Props {
  lesson: Lesson;
  dark: boolean;
  onExerciseComplete: () => void;
}

export function LessonView({ lesson, dark, onExerciseComplete }: Props) {
  return (
    <article className="lesson">
      <h1>{lesson.title}</h1>
      {lesson.blocks.map((block, i) => {
        switch (block.kind) {
          case "markdown":
            return <Markdown key={i} text={block.text} />;
          case "example":
            return <CodeRunner key={i} storageKey={`lesson.${lesson.id}.${i}.code`} initialCode={block.code} dark={dark} />;
          case "predict":
            return <PredictBlock key={i} code={block.code} explain={block.explain} dark={dark} />;
          case "steps":
            return (
              <StepExercise
                key={i}
                storageKey={exerciseKey(lesson.id, i)}
                starter={block.starter}
                steps={block.steps}
                dark={dark}
                onComplete={onExerciseComplete}
              />
            );
        }
      })}
    </article>
  );
}
