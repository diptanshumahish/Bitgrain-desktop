import React from "react";
import type { LucideIcon } from "lucide-react";

const ICON_SIZE = 14;
const ICON_STROKE = 1.75;

interface ExportOptionRowProps {
  icon: LucideIcon;
  title: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  trailing?: React.ReactNode;
}

export const ExportOptionRow: React.FC<ExportOptionRowProps> = ({ icon: Icon, title, hint, onClick, disabled = false, trailing }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-left hover:bg-[var(--s-bg-input-hover)] transition-colors disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  >
    <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-md border border-[var(--s-border)] text-[var(--s-text-muted)]">
      <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
    </span>
    <span className="flex flex-col gap-0.5 flex-1 min-w-0">
      <span className="text-[12px] font-medium text-[var(--s-text)]">{title}</span>
      <span className="text-[12px] leading-snug text-[var(--s-text-subtle)]">{hint}</span>
    </span>
    {trailing}
  </button>
);
