import React from "react";
import { Aperture } from "lucide-react";
import { addEffectClipAtPlayhead } from "../utils/timeline-actions";
import { EffectMenu } from "./panels/effects/effect-menu";
import { Tooltip } from "../../../components/studio/ui/Tooltip";
import { emitPopover } from "../../../lib/event-bus";

export const FxPicker: React.FC = () => {
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    emitPopover({
      type: "tool-dropdown",
      anchorRect: event.currentTarget.getBoundingClientRect(),
      content: (
        <EffectMenu
          onPick={(mode) => {
            addEffectClipAtPlayhead(mode);
            emitPopover(null);
          }}
        />
      ),
    });
  };

  return (
    <Tooltip content="Add an effect">
      <button
        type="button"
        onClick={openMenu}
        aria-label="Add effect"
        className="flex flex-col items-center justify-center gap-1 w-[58px] h-11 rounded-lg transition-colors text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
      >
        <span className="h-4 flex items-center justify-center">
          <Aperture size={14} strokeWidth={1.75} />
        </span>
        <span className="text-[9.5px] leading-none">Effect</span>
      </button>
    </Tooltip>
  );
};
