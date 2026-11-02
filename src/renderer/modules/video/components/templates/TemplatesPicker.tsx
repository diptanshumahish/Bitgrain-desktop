import React from "react";
import { LayoutTemplate } from "lucide-react";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { TemplatesGallery } from "./TemplatesGallery";

export const TemplatesPicker: React.FC = () => {
  const openGallery = (event: React.MouseEvent<HTMLButtonElement>) => {
    emitPopover({
      type: "tool-dropdown",
      anchorRect: event.currentTarget.getBoundingClientRect(),
      content: <TemplatesGallery />,
    });
  };

  return (
    <Tooltip content="Templates and transitions">
      <button
        type="button"
        onClick={openGallery}
        aria-label="Templates"
        className="flex flex-col items-center justify-center gap-1 w-[58px] h-11 rounded-lg transition-colors text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
      >
        <span className="h-4 flex items-center justify-center">
          <LayoutTemplate size={14} strokeWidth={1.75} />
        </span>
        <span className="text-[9.5px] leading-none">Templates</span>
      </button>
    </Tooltip>
  );
};
