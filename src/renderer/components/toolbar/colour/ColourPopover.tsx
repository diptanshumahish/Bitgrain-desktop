import React from "react";
import { Clapperboard, Droplet, Palette, SwatchBook } from "lucide-react";
import { Popover } from "../Popover";
import { ToggleSwitch } from "../controls/ToggleSwitch";
import { ColourMenuRow } from "./ColourMenuRow";
import { PageColourRow } from "./page-colour/PageColourRow";
import { emitModal } from "../../../lib/event-bus";
import { trackEvent } from "../../../lib/tracker";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../DesktopToolbar";

const ICON_SIZE = 15;
const GRADE_LOCK_HINT = "Turn off the film grade first";

interface ColourPopoverProps {
  state: ToolbarState;
  onOpen: (key: ActivePopover) => void;
  onClose: () => void;
}

const openColourStudio = (onClose: () => void): void => {
  trackEvent("home", "modal_opened", { details: { modal: "color-studio", source: "colour_menu" } });
  emitModal({ type: "color-studio" });
  onClose();
};

export const ColourPopover: React.FC<ColourPopoverProps> = ({ state: s, onOpen, onClose }) => {
  const gradeLocked = !!s.lutId;
  return (
    <Popover onClose={onClose} className="w-72">
      <div className="p-2 flex flex-col gap-0.5">
        <p className="text-[12px] font-semibold text-[var(--s-text)] px-2 pt-1 pb-1.5">Colour</p>
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text-muted)]">
            <Droplet size={ICON_SIZE} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[12px] font-medium leading-tight text-[var(--s-text)]">Keep colour</span>
            <span className="block truncate text-[12px] text-[var(--s-text-subtle)] leading-tight mt-0.5">Off turns it black and white</span>
          </span>
          <ToggleSwitch checked={s.isColor} onChange={s.toggleIsColor} label="Keep colour" />
        </div>
        <div className="h-px bg-[var(--s-border)] mx-2 my-1" />
        <PageColourRow />
        <div className="h-px bg-[var(--s-border)] mx-2 my-1" />
        <ColourMenuRow icon={<Palette size={ICON_SIZE} />} label="Palette" hint="Limit to a set of colours"
          active={!!s.palette} disabled={gradeLocked} disabledHint={GRADE_LOCK_HINT} onSelect={() => onOpen("palette")} />
        <ColourMenuRow icon={<Clapperboard size={ICON_SIZE} />} label="Film grade" hint="Looks from classic film stocks"
          active={gradeLocked} onSelect={() => onOpen("lut")} />
        <ColourMenuRow icon={<SwatchBook size={ICON_SIZE} />} label="Colour studio" hint="Palette and harmonies from your photo"
          active={false} onSelect={() => openColourStudio(onClose)} />
      </div>
    </Popover>
  );
};
