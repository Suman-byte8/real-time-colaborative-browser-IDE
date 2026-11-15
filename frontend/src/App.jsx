import React from "react";
import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

const App = () => {
  const editorRef = useRef(null);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("text"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.cuurent = editor;
  };

  return (
    <main className="w-full h-screen bg-red-500 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-300 rounded-lg"></aside>
      <section className="h-full w-3/4 bg-emerald-300 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Happy Coding!"
          theme="vs-dark"
        />
      </section>
    </main>
  );
};

export default App;
