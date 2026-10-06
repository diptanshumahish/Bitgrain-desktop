import React, { useEffect, useRef, useState } from "react";
import { useSignalValue } from "../../../lib/signal";
import { currentProjectSignal, updateProject } from "../store/project-store";

export const EditableTitle: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!project) return null;

  const commit = () => {
    const next = draft.trim() || project.name;
    if (next !== project.name) {
      updateProject((p) => ({ ...p, name: next }));
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
          }
        }}
        className="text-[12px] font-medium text-[var(--s-text)] bg-[var(--s-bg-input)] border border-[var(--s-border)] rounded px-2 py-0.5 outline-none focus:border-[var(--s-accent)] max-w-[260px]"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(project.name);
        setEditing(true);
      }}
      className="text-[12px] font-medium text-[var(--s-text)] truncate hover:underline cursor-text max-w-[260px] text-left"
      title="Click to rename"
    >
      {project.name}
    </button>
  );
};
