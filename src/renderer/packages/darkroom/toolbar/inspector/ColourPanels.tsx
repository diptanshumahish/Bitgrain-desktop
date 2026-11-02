import React from "react";
import { ColourPopover } from "../colour/ColourPopover";
import { PalettePopover } from "../popovers/PalettePopover";
import { LUTPopover } from "../popovers/LUTPopover";
import { PopoverBackProvider } from "@bitgrain/ui/controls/toolbar/popover-back/PopoverBackProvider";
import { PaperTexture } from "./tone/PaperTexture";
import { useEditorLayout } from "../panel-state/editor-layout-store";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../toolbar-types";

interface ColourPanelsProps {
  state: ToolbarState;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
}

export const ColourPanels: React.FC<ColourPanelsProps> = ({ state: s, active, toggle, close }) => {
  const showsRecipe = useEditorLayout() === "recipe";
  const subPanels = (
    <>
      {active === "palette" && <PalettePopover palette={s.palette} setPalette={s.setPalette} onClose={close} static />}
      {active === "lut" && <LUTPopover activeLutId={s.lutId} onSelectLUT={s.handleSelectLUT} onClose={close} static />}
    </>
  );
  return (
    <>
      {active === "colour" && <ColourPopover state={s} onOpen={toggle} onClose={close} static />}
      {(active === "colour" || active === "finish") && <PaperTexture state={s} />}
      {showsRecipe ? subPanels : (
        <PopoverBackProvider label="Colour" onBack={() => toggle("colour")}>
          {subPanels}
        </PopoverBackProvider>
      )}
    </>
  );
};
