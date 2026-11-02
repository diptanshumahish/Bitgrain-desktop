import React from "react";

interface HeaderIconButtonProps {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({ title, active = false, onClick, children }) => (
  <button
    type="button"
    title={title}
    aria-pressed={active}
    onClick={onClick}
    className={`w-6 h-6 rounded-md flex items-center justify-center border-none cursor-pointer transition-colors ${
      active
        ? "bg-[var(--s-bg-input)] text-[var(--s-text)]"
        : "bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
    }`}
  >
    {children}
  </button>
);
