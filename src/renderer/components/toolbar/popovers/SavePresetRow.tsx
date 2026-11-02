import React, { useState } from "react";
import { Check, X } from "lucide-react";

interface SavePresetRowProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const SavePresetRow: React.FC<SavePresetRowProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState("");
  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(name.trim());
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Preset name…"
        className="flex-1 text-[12px] bg-[var(--s-bg-input)] border border-[var(--s-border)] rounded-md px-2 py-1 outline-none focus:border-[var(--s-accent)] min-w-0 text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)]"
      />
      <button
        onClick={() => onSave(name.trim())}
        disabled={!name.trim()}
        className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--s-accent)] text-[var(--s-accent-text)] disabled:opacity-30 hover:opacity-90 transition-all shrink-0"
      >
        <Check size={10} strokeWidth={3} />
      </button>
      <button
        onClick={onCancel}
        className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input-hover)] transition-all shrink-0"
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </div>
  );
};
