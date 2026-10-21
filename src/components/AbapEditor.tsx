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
  /** Ctrl+Enter; receives the current editor text */
  onRun: (code: string) => void;
  dark: boolean;
  /** grow with the content instead of filling the parent (for editors embedded in text) */
  autoHeight?: boolean;
  /** smallest height in pixels when growing with the content */
  minHeight?: number;
  readOnly?: boolean;
}

export function AbapEditor({ value, onChange, diagnostics, onRun, dark, autoHeight, minHeight = 0, readOnly }: Props) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const [height, setHeight] = useState(() => value.split("\n").length * 19 + 16);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    // an action is bound to this editor; addCommand would be global, so with several editors
    // on a page Ctrl+Enter would always run the last one
    editor.addAction({
      id: "abap.run",
      label: "Run",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      // pass the editor's text: React state may not have caught up with the last keystroke yet
      run: ed => onRunRef.current(ed.getValue()),
    });
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
      height={autoHeight ? Math.max(height, minHeight) : "100%"}
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
        readOnly,
        domReadOnly: readOnly,
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
