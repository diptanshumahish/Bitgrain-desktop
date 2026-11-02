import React from "react";

interface SheetListItemProps {
  icon: React.ReactNode;
  label: string;
  detail?: string;
  active?: boolean;
  onClick: () => void;
}

export const SheetListItem: React.FC<SheetListItemProps> = ({ icon, label, detail, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active || undefined}
    className={`w-full flex items-center gap-3.5 px-5 min-h-[56px] text-left transition-colors active:bg-[var(--s-bg-input-hover)] ${
      active ? "bg-[var(--s-accent-soft)]" : ""
    }`}
  >
    <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-[var(--s-bg-input)] text-[var(--s-text)]">{icon}</span>
    <span className="flex flex-col min-w-0">
      <span className="truncate text-[14px] font-medium text-[var(--s-text)]">{label}</span>
      {detail && <span className="truncate text-[12px] text-[var(--s-text-muted)]">{detail}</span>}
    </span>
  </button>
);
