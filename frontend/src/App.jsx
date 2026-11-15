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

  const [users, setUsers] = useState([]);

  useEffect(() => {

    console.log("Editor:", editor, "YDoc:", ydoc, "YText:", yText, "Username:", username);

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

    provider.awareness.setLocalStateField("user", {
      name: username,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    });

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      setUsers(states.filter((state) => state.user?.name).map((state) => state.user));
    };
    provider.awareness.on("change", updateUsers);
    updateUsers();

    function handleBeforeUnload() {
      provider.awareness.setLocalStateField("user", null);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    

    const binding = new MonacoBinding(yText, model, new Set([editor]), provider.awareness);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      provider.awareness.off("change", updateUsers);
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
      <aside className="h-full w-1/4 bg-amber-300 rounded-lg">
        <h2 className="text-xl font-bold p-4">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={index} className="flex items-center gap-2 mb-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: user.color }}
              ></span>
              {user.name}
            </li>
          ))}
        </ul>
      </aside>
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
