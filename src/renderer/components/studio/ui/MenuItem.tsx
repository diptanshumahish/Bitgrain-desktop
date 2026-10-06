import React from "react";

interface MenuItemProps {
  label: string;
  glyph?: string;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  onClick: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  glyph,
  shortcut,
  disabled,
  checked,
  onClick,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-between px-3 py-[3.5px] text-[11.5px] border-none cursor-pointer bg-transparent text-[var(--s-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[var(--s-accent)] hover:text-[var(--s-accent-text)] rounded-md"
  >
    <span className="flex items-center gap-2.5">
      <span className="w-3 shrink-0 text-[10px] flex items-center justify-center opacity-60">
        {checked ? "✓" : glyph}
      </span>
      {label}
    </span>
    {shortcut && (
      <span className="  text-[9px] opacity-40 ml-6 shrink-0">{shortcut}</span>
    )}
  </button>
);
