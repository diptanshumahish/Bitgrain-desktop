import React from "react";

interface FindTextFieldProps {
  label: string;
  value: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}

export const FindTextField: React.FC<FindTextFieldProps> = ({ label, value, autoFocus, onChange, onKeyDown, children }) => (
  <div className="flex items-center gap-1 h-8 pl-2.5 pr-1 rounded-lg bg-[var(--s-bg-input)] focus-within:ring-1 focus-within:ring-[var(--s-accent)]">
    <input
      type="text"
      value={value}
      placeholder={label}
      aria-label={label}
      autoFocus={autoFocus}
      spellCheck={false}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      className="flex-1 min-w-0 bg-transparent border-none outline-none text-[12px] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)]"
    />
    {children}
  </div>
);
