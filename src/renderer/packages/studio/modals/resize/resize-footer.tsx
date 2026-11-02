import React from "react";
import { Lock } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";

const LOCK_ICON_SIZE = 12;

interface ResizeFooterProps {
  count: number;
  canPickMany: boolean;
  onApply: () => void;
  onUnlock: () => void;
}

const applyLabel = (count: number): string => {
  if (count === 0) return "Pick a size";
  return count === 1 ? "Create 1 new size" : `Create ${count} new sizes`;
};

export const ResizeFooter: React.FC<ResizeFooterProps> = ({ count, canPickMany, onApply, onUnlock }) => (
  <div className="flex items-center justify-between gap-3">
    {canPickMany ? (
      <p className="text-[11.5px] text-[var(--s-text-muted)]">Each size becomes a new page. Your original stays as it is.</p>
    ) : (
      <button
        type="button"
        onClick={onUnlock}
        className="flex items-center gap-1.5 text-left text-[11.5px] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
      >
        <Lock size={LOCK_ICON_SIZE} strokeWidth={1.75} className="shrink-0" />
        Free makes one size at a time. Pick several at once with Pro.
      </button>
    )}
    <Button variant="primary" size="md" onClick={onApply} disabled={count === 0}>
      {applyLabel(count)}
    </Button>
  </div>
);
