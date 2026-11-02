import React, { useEffect, useRef, useState } from "react";

interface TopBarProjectProps {
  workName?: string;
  canvasWidth: number;
  canvasHeight: number;
  onRename: (name: string) => void;
}

const formatDimensions = (w: number, h: number): string =>
  `${w.toLocaleString()} × ${h.toLocaleString()}`;

export const TopBarProject: React.FC<TopBarProjectProps> = ({
  workName, canvasWidth, canvasHeight, onRename,
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = (value: string): void => {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== workName) onRename(trimmed);
  };

  return (
    <div className="flex items-center gap-1.5 max-w-[420px] min-w-0 select-none">
      {editing ? (
        <input
          ref={inputRef}
          defaultValue={workName ?? ""}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setEditing(false);
            e.stopPropagation();
          }}
          className="text-[13px] font-medium w-[220px] min-w-0 bg-[var(--s-bg-panel)] text-[var(--s-text)] border border-[var(--s-accent)] rounded px-1.5 py-0.5 outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Rename"
          className="text-[13px] font-medium text-[var(--s-text)] truncate rounded px-1.5 py-0.5 -mx-1 hover:bg-[var(--s-bg-input)] transition-colors"
        >
          {workName ?? "Studio"}
        </button>
      )}
      <span
        aria-hidden
        className="hidden 2xl:block w-px h-3 bg-[var(--s-border)] shrink-0"
      />
      <span className="hidden 2xl:inline text-[12px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums] shrink-0">
        {formatDimensions(canvasWidth, canvasHeight)}
      </span>
    </div>
  );
};
