import React from "react";

interface MenuOptionRowProps {
  label: string;
  detail: string;
  icon?: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MenuOptionRow: React.FC<MenuOptionRowProps> = ({ label, detail, icon, onClick }) => (
  <button type="button" onClick={onClick}
    className="w-full flex items-start gap-3 px-2.5 py-2 rounded-lg text-left text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors">
    {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
    <span className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[13px] font-medium">{label}</span>
      <span className="text-[12px] text-[var(--s-text-muted)]">{detail}</span>
    </span>
  </button>
);
