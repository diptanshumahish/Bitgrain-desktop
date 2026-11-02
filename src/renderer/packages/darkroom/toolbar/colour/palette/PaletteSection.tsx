import React from "react";
import type { Palette } from "@bitgrain/engine/core/types";
import { useSignalValue } from "@bitgrain/core/signal";
import { PaletteHeader } from "./PaletteHeader";
import { PaletteCard } from "./PaletteCard";
import { PaletteStrip } from "./PaletteStrip";
import { PaletteGroupTabs } from "./PaletteGroupTabs";
import { PALETTE_GROUPS } from "./palette-groups";
import { paletteFromOutput } from "./palette-from-output";
import { groupOfPalette, paletteGroupSignal } from "./palette-group-store";

const OFF_HINT = "Off, every colour stays";
const LOCKED_HINT = "Turn off the film grade first";

interface PaletteSectionProps {
  palette: Palette | null;
  setPalette: (palette: Palette | null) => void;
  locked: boolean;
}

export const PaletteSection: React.FC<PaletteSectionProps> = ({ palette, setPalette, locked }) => {
  const activeGroup = useSignalValue(paletteGroupSignal);
  const selectedGroup = groupOfPalette(palette);
  const visible = PALETTE_GROUPS.find((group) => group.title === activeGroup) ?? PALETTE_GROUPS[0];
  const applyFromPhoto = (): void => {
    const generated = paletteFromOutput();
    if (generated) setPalette(generated);
  };
  return (
    <div className="px-2 py-2 flex flex-col gap-2.5">
      <PaletteHeader palette={palette} hint={locked ? LOCKED_HINT : OFF_HINT} disabled={locked} onFromPhoto={applyFromPhoto} onClear={() => setPalette(null)} />
      {palette && !selectedGroup && <PaletteStrip colours={palette.colors} className="block w-full h-6 rounded-md overflow-hidden" />}
      <PaletteGroupTabs activeGroup={visible.title} selectedGroup={selectedGroup} />
      <div className="grid grid-cols-2 gap-1.5">
        {visible.palettes.map((entry) => (
          <PaletteCard key={entry.id} palette={entry} selected={palette?.id === entry.id} disabled={locked} onSelect={setPalette} />
        ))}
      </div>
    </div>
  );
};
