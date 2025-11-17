 import { useState, useEffect, useRef } from "react";
import "./index.css";

const Editor = () => {
  const editorRef = useRef(null);
  const url = "https://cofluxeditor.onrender.com";

  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Load docs from backend
  useEffect(() => {
    const loadDocs = async () => {
      const r = await fetch(url);
      const result = await r.json();

      const mapped = result.map((d, i) => ({
        id: i + 1,
        dbId: d._id, // MongoDB _id saved
        title: `Doc ${i + 1}`,
        content: d.content
      }));

      setDocuments(mapped);

      if (mapped.length > 0) {
        setActiveId(mapped[0].id);
      }
    };

    loadDocs();
  }, []);

  const activeDoc = documents.find((d) => d.id === activeId) || {
    content: "",
    title: ""
  };

  // PUT update content in backend + local state
  const updateContent = async (html) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeId ? { ...doc, content: html } : doc
      )
    );

    const doc = documents.find((d) => d.id === activeId);
    if (!doc) return;

    await fetch(url + doc.dbId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: html })
    });
  };

  // Local title change (not stored in backend)
  const updateTitle = (title) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeId ? { ...doc, title } : doc
      )
    );
  };

  // Add new local tab (not saved to DB)
  const newDocument = () => {
    const newId = documents.length + 1;
    const newDoc = {
      id: newId,
      dbId: null, // no backend id yet
      title: `Untitled ${newId}`,
      content: ""
    };

    setDocuments([...documents, newDoc]);
    setActiveId(newId);
  };

  // Close tab
  const closeTab = (id) => {
    if (documents.length === 1) return;

    const filtered = documents.filter((doc) => doc.id !== id);
    setDocuments(filtered);

    if (activeId === id && filtered.length > 0) {
      setActiveId(filtered[0].id);
    }
  };

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const download = () => {
    const blob = new Blob([activeDoc.content], { type: "text/html" });
    const link = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = link;
    a.download = `${activeDoc.title}.html`;
    a.click();

    URL.revokeObjectURL(link);
  };

  const wordCount = activeDoc.content
    .replace(/<[^>]+>/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  // Load editor content when switching tabs
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = activeDoc.content;
    }
  }, [activeId]);

  return (
    <div className="container">

      {/* Tabs */}
      <div className="tab-bar">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`tab ${doc.id === activeId ? "active" : ""}`}
            onClick={() => setActiveId(doc.id)}
          >
            <span>{doc.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(doc.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button className="new-btn" onClick={newDocument}>
          +
        </button>
      </div>

      {/* Title */}
      <header>
        <input
          className="title-input"
          value={activeDoc.title}
          onChange={(e) => updateTitle(e.target.value)}
        />
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={() => exec("bold")}>B</button>
        <button onClick={() => exec("italic")}>I</button>
        <button onClick={() => exec("underline")}>U</button>

        <input type="color" onChange={(e) => exec("foreColor", e.target.value)} />

        <button onClick={() => exec("insertUnorderedList")}>• List</button>
        <button onClick={() => exec("insertOrderedList")}>1. List</button>

        <button onClick={() => exec("justifyLeft")}>Left</button>
        <button onClick={() => exec("justifyCenter")}>Center</button>
        <button onClick={() => exec("justifyRight")}>Right</button>

        <button className="download" onClick={download}>
          Download
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="editor"
        contentEditable
        onInput={(e) => updateContent(e.target.innerHTML)}
      ></div>

      {/* Footer */}
      <footer>{wordCount} words</footer>
    </div>
  );
};

export default Editor;
