import React from "react";

interface SheetRowProps {
  label: string;
  children: React.ReactNode;
}

export const SheetRow: React.FC<SheetRowProps> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 px-5 min-h-[52px]">
    <span className="text-[13px] text-[var(--s-text-muted)] shrink-0">{label}</span>
    <div className="flex items-center gap-2 min-w-0">{children}</div>
  </div>
);
