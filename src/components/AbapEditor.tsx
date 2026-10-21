import { useEffect, useRef, useState } from "react";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import type { Diagnostic } from "../engine/engine";

// bundle Monaco locally instead of loading it from a CDN
self.MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });

interface Props {
  value: string;
  onChange: (value: string) => void;
  diagnostics: Diagnostic[];
  onRun: () => void;
  dark: boolean;
  /** grow with the content instead of filling the parent (for editors embedded in text) */
  autoHeight?: boolean;
}

export function AbapEditor({ value, onChange, diagnostics, onRun, dark, autoHeight }: Props) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const [height, setHeight] = useState(() => value.split("\n").length * 19 + 16);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current());
    if (autoHeight) {
      editor.onDidContentSizeChange(e => setHeight(e.contentHeight));
    }
  };

  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, "abaplint", diagnostics.map(d => ({
      severity: monaco.MarkerSeverity.Error,
      message: d.message,
      startLineNumber: d.row,
      startColumn: d.col,
      endLineNumber: d.endRow,
      endColumn: d.endCol === d.col && d.endRow === d.row ? d.col + 1 : d.endCol,
    })));
  }, [diagnostics]);

  return (
    <Editor
      height={autoHeight ? height : "100%"}
      language="abap"
      theme={dark ? "vs-dark" : "vs"}
      value={value}
      onChange={v => onChange(v ?? "")}
      onMount={handleMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 2,
        automaticLayout: true,
        fixedOverflowWidgets: true,
        ...(autoHeight && {
          scrollbar: { alwaysConsumeMouseWheel: false, vertical: "hidden" },
          padding: { top: 8, bottom: 8 },
          lineNumbersMinChars: 3,
          overviewRulerLanes: 0,
          renderLineHighlightOnlyWhenFocus: true,
        }),
      }}
    />
  );
}
