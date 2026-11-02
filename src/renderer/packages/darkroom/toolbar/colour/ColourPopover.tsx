import React from "react";
import { Clapperboard, SwatchBook } from "lucide-react";
import { Popover } from "@bitgrain/ui/controls/toolbar/Popover";
import { ColourMenuRow } from "./ColourMenuRow";
import { ColourModeSwitch } from "./ColourModeSwitch";
import { PageColourRow } from "./page-colour/PageColourRow";
import { PaletteSection } from "./palette/PaletteSection";
import { emitDarkroomModal } from "../../modals/darkroom-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../toolbar-types";

const ICON_SIZE = 15;
const DIVIDER_CLASS = "h-px bg-[var(--s-border)] mx-2 my-1";

interface ColourPopoverProps {
  state: ToolbarState;
  onOpen: (key: ActivePopover) => void;
  onClose: () => void;
  static?: boolean;
}

const openColourStudio = (onClose: () => void): void => {
  trackEvent("home", "modal_opened", { details: { modal: "color-studio", source: "colour_menu" } });
  emitDarkroomModal({ type: "color-studio" });
  onClose();
};

export const ColourPopover: React.FC<ColourPopoverProps> = ({ state: s, onOpen, onClose, static: isStatic = false }) => {
  const gradeLocked = !!s.lutId;
  return (
    <Popover onClose={onClose} className="w-72" static={isStatic}>
      <div className="p-2 flex flex-col gap-0.5">
        <ColourModeSwitch isColor={s.isColor} onToggle={s.toggleIsColor} />
        <PaletteSection palette={s.palette} setPalette={s.setPalette} locked={gradeLocked} />
        <div className={DIVIDER_CLASS} />
        <PageColourRow />
        <div className={DIVIDER_CLASS} />
        <ColourMenuRow icon={<Clapperboard size={ICON_SIZE} />} label="Film grade" hint="Looks from classic film stocks"
          active={gradeLocked} onSelect={() => onOpen("lut")} />
        <ColourMenuRow icon={<SwatchBook size={ICON_SIZE} />} label="Colour studio" hint="Palette and harmonies from your photo"
          active={false} onSelect={() => openColourStudio(onClose)} />
      </div>
    </Popover>
  );
};
