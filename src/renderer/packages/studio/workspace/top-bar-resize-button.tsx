import React from "react";
import { Proportions } from "lucide-react";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";

const RESIZE_ICON_SIZE = 13;

interface TopBarResizeButtonProps {
  onResize: () => void;
}

export const TopBarResizeButton: React.FC<TopBarResizeButtonProps> = ({ onResize }) => (
  <Tooltip content="Resize to formats">
    <button
      type="button"
      onClick={onResize}
      aria-label="Resize to formats"
      className="flex items-center gap-1.5 h-7 px-2 mr-1 rounded-md border-none cursor-pointer bg-transparent text-[12px] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors active:scale-95"
    >
      <Proportions size={RESIZE_ICON_SIZE} strokeWidth={1.75} />
      <span className="hidden xl:inline">Resize</span>
    </button>
  </Tooltip>
);
