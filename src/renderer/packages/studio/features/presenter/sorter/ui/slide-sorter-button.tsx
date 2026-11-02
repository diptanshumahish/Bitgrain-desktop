import React from "react";
import { LayoutGrid } from "lucide-react";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { openSlideSorter } from "../state/slide-sorter-store";

export const SlideSorterButton: React.FC = () => (
  <Tooltip content="Slide sorter (G)">
    <button
      type="button"
      onClick={openSlideSorter}
      aria-label="Open slide sorter"
      className="w-7 h-7 shrink-0 flex items-center justify-center rounded-sm text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors duration-100"
    >
      <LayoutGrid size={12} strokeWidth={1.75} />
    </button>
  </Tooltip>
);
