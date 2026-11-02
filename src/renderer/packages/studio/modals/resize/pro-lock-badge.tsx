import React from "react";
import { Lock } from "lucide-react";

const LOCK_ICON_SIZE = 11;

export const ProLockBadge: React.FC = () => (
  <span className="flex shrink-0 items-center gap-1 rounded-md border border-[var(--s-border)] px-1.5 py-0.5 text-[11px] text-[var(--s-text-muted)]">
    <Lock size={LOCK_ICON_SIZE} strokeWidth={1.75} />
    Pro
  </span>
);
