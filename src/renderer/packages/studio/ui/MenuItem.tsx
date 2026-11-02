import React from "react";

interface MenuItemProps {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  onClick: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  shortcut,
  disabled,
  checked,
  onClick,
}) => (
  <button
    type="button"
    role={checked === undefined ? "menuitem" : "menuitemcheckbox"}
    aria-checked={checked}
    onClick={onClick}
    disabled={disabled}
    className="group w-full flex items-center justify-between px-3 py-1.5 text-[13px] border-none cursor-pointer bg-transparent text-[var(--s-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[var(--s-accent)] hover:text-[var(--s-accent-text)] rounded-md"
  >
    <span className="flex items-center gap-2.5">
      {checked !== undefined && (
        <span className="w-3 shrink-0 text-[12px] flex items-center justify-center">
          {checked ? "✓" : ""}
        </span>
      )}
      {label}
    </span>
    {shortcut && (
      <span className="text-[12px] text-[var(--s-text-subtle)] group-hover:text-[var(--s-accent-text)] ml-6 shrink-0">{shortcut}</span>
    )}
  </button>
);
