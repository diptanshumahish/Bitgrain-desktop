import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../../ui/panel-group";
import { ColorPicker } from "../../../ui/ColorPicker";
import { collectColours, replaceColours } from "../../../features/elements/recolour/group-colours";
import { buildEntries } from "../shared/build-entries";
import type { LayerUpdateEntry } from "../shared/layer-update-entry";

const MAX_LISTED_COLOURS = 12;
const MIN_COLOURS_FOR_PALETTE = 2;

interface SelectionColoursSectionProps {
  layers: Layer[];
  onUpdateLayers: (entries: LayerUpdateEntry[]) => void;
}

const isContainer = (layer: Layer): boolean => layer.type === "group" || layer.type === "frame";

const shouldShowPalette = (layers: Layer[], colours: string[]): boolean =>
  colours.length >= MIN_COLOURS_FOR_PALETTE || (colours.length > 0 && layers.some(isContainer));

export const SelectionColoursSection: React.FC<SelectionColoursSectionProps> = ({ layers, onUpdateLayers }) => {
  const colours = collectColours(layers);
  if (!shouldShowPalette(layers, colours)) return null;

  const swapColour = (from: string, to: string): void => {
    const swaps = new Map([[from, to]]);
    onUpdateLayers(buildEntries(layers, (layer) => replaceColours([layer], swaps)[0]));
  };

  return (
    <PanelGroup title="Colours in selection">
      <div className="grid grid-cols-2 gap-1.5">
        {colours.slice(0, MAX_LISTED_COLOURS).map((colour, index) => (
          <ColorPicker key={index} color={colour} onChange={(next) => swapColour(colour, next)} />
        ))}
      </div>
      {colours.length > MAX_LISTED_COLOURS && (
        <span className="text-[12px] text-[var(--s-text-subtle)]">
          Showing {MAX_LISTED_COLOURS} of {colours.length} colours
        </span>
      )}
    </PanelGroup>
  );
};
