import React from "react";
import { Check } from "lucide-react";

export const NameField: React.FC<{
  value: string;
  onCommit: (value: string) => void;
}> = ({ value, onCommit }) => (
  <input
    defaultValue={value}
    onBlur={(event) => onCommit(event.target.value.trim() || value)}
    className="flex-1 min-w-0 bg-transparent border-b border-transparent outline-none text-[11px] text-[var(--s-text)] focus:border-[var(--s-accent)] transition-colors"
  />
);

export const ApplyButton: React.FC<{
  enabled: boolean;
  title: string;
  onClick: () => void;
}> = ({ enabled, title, onClick }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 ${
      enabled
        ? "bg-[var(--s-accent)] text-[var(--s-accent-text)] hover:opacity-90"
        : "text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
    }`}
  >
    <Check size={12} strokeWidth={enabled ? 2.75 : 2} />
  </button>
);
