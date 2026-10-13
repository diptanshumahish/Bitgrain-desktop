import React from "react";
import { TabButton } from "../TabButton";
import { EffectsPopover } from "../effects/EffectsPopover";
import { EffectPanels } from "./EffectPanels";
import { PopoverBackProvider } from "../popover-back/PopoverBackProvider";
import { currentEffectGlyph, currentEffectLabel } from "../effects/current-effect-label";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../DesktopToolbar";

const EFFECT_POPOVERS: ActivePopover[] = ["effects", "algorithm", "halftone", "popart", "ascii", "braille", "contour", "inkwash", "manga"];

interface EffectsTabProps {
  state: ToolbarState;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
}

export const EffectsTab: React.FC<EffectsTabProps> = ({ state: s, active, toggle, close }) => {
  const isOpen = EFFECT_POPOVERS.includes(active);
  const hasEffect = !s.mode.includes("original");
  return (
    <div className="relative" data-tutorial="home-algorithm">
      <TabButton
        icon={
          <span aria-hidden="true" className="font-mono text-[8px] leading-none inline-flex items-center justify-center w-[18px] h-[14px] overflow-hidden select-none tracking-tighter">
            {currentEffectGlyph(s.mode)}
          </span>
        }
        label={currentEffectLabel(s.mode)}
        active={isOpen}
        expanded={isOpen}
        indicator={hasEffect && !isOpen}
        onClick={() => (isOpen ? close() : toggle("effects"))}
        disabled={!s.hasImage}
        disabledTooltip="Upload an image first"
      />
      {active === "effects" && <EffectsPopover state={s} onOpen={toggle} onClose={close} />}
      <PopoverBackProvider label="Effects" onBack={() => toggle("effects")}>
        <EffectPanels state={s} active={active} close={close} />
      </PopoverBackProvider>
    </div>
  );
};
