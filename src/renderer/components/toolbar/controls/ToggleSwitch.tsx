import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
      checked ? "bg-[var(--s-accent)]" : "bg-[var(--s-bg-input)]"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 rounded-full transform transition-transform duration-200 ${
        checked ? "translate-x-4 bg-[var(--s-accent-text)]" : "translate-x-0 bg-[var(--s-text-subtle)]"
      }`}
    />
  </button>
);
