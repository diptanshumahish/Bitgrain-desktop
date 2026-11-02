import React from "react";

interface OrDividerProps {
  compact: boolean;
}

export const OrDivider: React.FC<OrDividerProps> = ({ compact }) => (
  <div className="flex items-center gap-2" aria-hidden="true">
    <span className="h-px flex-1 bg-[var(--s-border)]" />
    <span className={`text-[var(--s-text-subtle)] ${compact ? "text-[9px]" : "text-[11px]"}`}>or</span>
    <span className="h-px flex-1 bg-[var(--s-border)]" />
  </div>
);
