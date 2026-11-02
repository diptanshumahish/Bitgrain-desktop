import React from "react";
import type { LucideIcon } from "lucide-react";

interface FindIconButtonProps {
  Icon: LucideIcon;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const ICON_SIZE = 14;

export const FindIconButton: React.FC<FindIconButtonProps> = ({ Icon, title, active = false, disabled = false, onClick }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
    className={`w-7 h-7 shrink-0 rounded-md border-none cursor-pointer flex items-center justify-center transition-colors duration-100 disabled:opacity-35 disabled:cursor-default ${
      active
        ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
        : "bg-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
    }`}
  >
    <Icon size={ICON_SIZE} strokeWidth={1.75} />
  </button>
);
