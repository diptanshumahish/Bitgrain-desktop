import React from "react";

interface CommitTextInputProps {
  value: string;
  label: string;
  onCommit: (value: string) => void;
}

const commitFrom = (input: HTMLInputElement, value: string, onCommit: (value: string) => void): void => {
  const next = input.value.trim();
  if (!next) {
    input.value = value;
    return;
  }
  if (next !== value) onCommit(next);
};

export const CommitTextInput: React.FC<CommitTextInputProps> = ({ value, label, onCommit }) => (
  <input
    key={value}
    type="text"
    defaultValue={value}
    aria-label={label}
    onBlur={(event) => commitFrom(event.currentTarget, value, onCommit)}
    onKeyDown={(event) => {
      if (event.key === "Enter") event.currentTarget.blur();
      if (event.key === "Escape") {
        event.currentTarget.value = value;
        event.currentTarget.blur();
      }
    }}
    className="w-full min-w-0 h-7 px-2 rounded-md bg-[var(--s-bg-input)] text-[11.5px] text-[var(--s-text)] outline-none focus:ring-1 focus:ring-[var(--s-text)]"
  />
);
