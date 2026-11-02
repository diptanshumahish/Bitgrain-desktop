import React from "react";

interface IconButtonProps {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  pressed?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ label, onClick, children, pressed, className = "" }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    title={label}
    onClick={onClick}
    className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-md border-none cursor-pointer transition-colors ${pressed ? "bg-[var(--s-bg-input)] text-[var(--s-text)]" : "bg-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"} ${className}`}
  >
    {children}
  </button>
);
