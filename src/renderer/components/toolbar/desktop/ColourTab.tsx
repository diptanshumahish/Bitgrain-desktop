import React from "react";
import { Palette } from "lucide-react";
import { TabButton } from "../TabButton";
import { ColourPopover } from "../colour/ColourPopover";
import { PalettePopover } from "../popovers/PalettePopover";
import { LUTPopover } from "../popovers/LUTPopover";
import { PopoverBackProvider } from "../popover-back/PopoverBackProvider";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../DesktopToolbar";

const COLOUR_POPOVERS: ActivePopover[] = ["colour", "palette", "lut"];

interface ColourTabProps {
  state: ToolbarState;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
}

export const ColourTab: React.FC<ColourTabProps> = ({ state: s, active, toggle, close }) => {
  const isOpen = COLOUR_POPOVERS.includes(active);
  const hasColourChange = !!s.palette || !!s.lutId;
  return (
    <div className="relative">
      <TabButton
        icon={<Palette size={14} strokeWidth={2} />}
        label="colour"
        active={isOpen}
        expanded={isOpen}
        indicator={hasColourChange && !isOpen}
        onClick={() => (isOpen ? close() : toggle("colour"))}
        disabled={!s.hasImage}
        disabledTooltip="Upload an image first"
      />
      {active === "colour" && <ColourPopover state={s} onOpen={toggle} onClose={close} />}
      <PopoverBackProvider label="Colour" onBack={() => toggle("colour")}>
        {active === "palette" && <PalettePopover palette={s.palette} setPalette={s.setPalette} onClose={close} />}
        {active === "lut" && <LUTPopover activeLutId={s.lutId} onSelectLUT={(id) => { s.handleSelectLUT(id); if (id) close(); }} onClose={close} />}
      </PopoverBackProvider>
    </div>
  );
};
