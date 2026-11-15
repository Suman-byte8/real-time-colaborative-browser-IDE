import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

const App = () => {
  const [editor, setEditor] = useState(null);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const [username, setUsername] = useState(()=>{
    const params = new URLSearchParams(window.location.search);
    return params.get("username") || "";
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const model = editor.getModel();
    if (!model) {
      throw new Error("The Monaco editor model is unavailable.");
    }

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      { autoConnect: true },
    );
    const binding = new MonacoBinding(yText, model, new Set([editor]), provider.awareness);

    return () => {
      binding.destroy();
      provider.destroy();
    };
  }, [editor, yText, ydoc]);


  const handleJoin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({}, "", `?username=${e.target.username.value}`);
  }

  if(!username) {
    return (
      <main className="w-full h-screen bg-red-500 flex items-center justify-center">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg">
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="w-full h-screen bg-red-500 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-300 rounded-lg"></aside>
      <section className="h-full w-3/4 bg-emerald-300 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Happy Coding!"
          theme="vs-dark"
          onMount={setEditor}
        />
      </section>
    </main>
  );
};

export default App;
