import React from "react";
import { Group, Shuffle } from "lucide-react";
import { MOD_KEY } from "../../editor/shortcut-labels";

interface ArrangeActionsProps {
  count: number;
  onGroup: () => void;
  onScatterCollage?: () => void;
}

export const ArrangeActions: React.FC<ArrangeActionsProps> = ({ count, onGroup, onScatterCollage }) => (
  <div className="flex flex-col gap-1.5">
    <button
      type="button"
      onClick={onGroup}
      className="w-full h-8 flex items-center gap-2 px-3 rounded-md border-none cursor-pointer bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[12px] font-medium hover:opacity-90 transition-opacity"
    >
      <Group size={13} strokeWidth={1.75} />
      <span className="flex-1 text-left">Group {count} layers</span>
      <span className="text-[12px] opacity-60">{MOD_KEY}G</span>
    </button>
    {onScatterCollage && (
      <button
        type="button"
        onClick={onScatterCollage}
        className="w-full h-8 flex items-center gap-2 px-3 rounded-md border-none cursor-pointer bg-[var(--s-bg-input)] text-[var(--s-text-muted)] text-[12px] font-medium hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors"
      >
        <Shuffle size={13} strokeWidth={1.75} />
        <span className="flex-1 text-left">Scatter into collage</span>
      </button>
    )}
  </div>
);
