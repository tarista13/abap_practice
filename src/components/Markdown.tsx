import { useMemo } from "react";
import { marked } from "marked";

/** Renders lesson Markdown. Lesson text is our own content, so rendering its HTML is safe. */
export function Markdown({ text, className = "prose" }: { text: string; className?: string }) {
  const html = useMemo(() => marked.parse(text, { async: false }), [text]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
