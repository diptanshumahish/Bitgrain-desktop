import React from "react";

interface ToolTopBarProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export const ToolTopBar: React.FC<ToolTopBarProps> = ({ left, center, right, className = "grid" }) => (
  <header className={`${className} grid-cols-[1fr_auto_1fr] h-12 shrink-0 items-center gap-3 px-3 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial`}>
    <div className="flex items-center gap-2 min-w-0 overflow-hidden">{left}</div>
    <div className="flex items-center gap-0.5">{center}</div>
    <div className="flex items-center justify-end gap-1 min-w-0">{right}</div>
  </header>
);
