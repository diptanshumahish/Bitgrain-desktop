import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { canvasAidsSignal, toggleGuides } from "../../state/canvas-aids/canvas-aids-visibility";
import { Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";

export const GuidesVisibilityToggle: React.FC = () => {
  const { guides } = useSignalValue(canvasAidsSignal);
  return <Toggle label="Show guides" value={guides} onChange={toggleGuides} />;
};
