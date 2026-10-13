import React from "react";
import type { GroupLayer, Layer } from "../../../data/studioTypes";
import { PanelGroup } from "../../../components/studio/ui/panel-group";
import { ColorPicker } from "../../../components/studio/ui/ColorPicker";
import { collectColours, normalizeHex, replaceColours } from "./group-colours";
import { matchColoursByLuminance } from "./match-colours";

const MAX_LISTED_COLOURS = 12;
const MIN_PAGE_COLOURS_TO_MATCH = 2;

interface GroupColoursSectionProps {
  layer: GroupLayer;
  pageLayers: Layer[];
  pageBackground: string;
  onChange: (updates: Partial<GroupLayer>) => void;
}

const pageColoursAround = (layer: GroupLayer, pageLayers: Layer[], pageBackground: string): string[] => {
  const others = pageLayers.filter((candidate) => candidate.id !== layer.id);
  const background = normalizeHex(pageBackground);
  return collectColours(others).filter((colour) => colour !== background);
};

export const GroupColoursSection: React.FC<GroupColoursSectionProps> = ({ layer, pageLayers, pageBackground, onChange }) => {
  const colours = collectColours(layer.layers);
  if (colours.length === 0) return null;
  const pageColours = pageColoursAround(layer, pageLayers, pageBackground);
  const canMatch = pageColours.length >= MIN_PAGE_COLOURS_TO_MATCH;

  const swapColour = (from: string, to: string): void => {
    onChange({ layers: replaceColours(layer.layers, new Map([[from, to]])) });
  };

  const matchPage = (): void => {
    onChange({ layers: replaceColours(layer.layers, matchColoursByLuminance(colours, pageColours)) });
  };

  return (
    <PanelGroup title="Colours in this group">
      <div className="grid grid-cols-2 gap-1.5">
        {colours.slice(0, MAX_LISTED_COLOURS).map((colour) => (
          <ColorPicker key={colour} color={colour} onChange={(next) => swapColour(colour, next)} />
        ))}
      </div>
      {colours.length > MAX_LISTED_COLOURS && (
        <span className="text-[10.5px] text-[var(--s-text-subtle)]">
          Showing {MAX_LISTED_COLOURS} of {colours.length} colours
        </span>
      )}
      <button
        type="button"
        onClick={matchPage}
        disabled={!canMatch}
        title={canMatch ? "Darkest matches darkest, lightest matches lightest" : "Add a few coloured layers to the page first"}
        className="h-8 rounded-md bg-[var(--s-bg-input)] text-[11px] font-medium text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Match page colours
      </button>
    </PanelGroup>
  );
};
