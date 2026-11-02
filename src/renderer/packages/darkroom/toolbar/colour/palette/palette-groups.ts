import type { Palette } from "@bitgrain/engine/core/types";
import { PALETTES } from "@bitgrain/engine/color/palettes";

interface PaletteGroup {
  title: string;
  palettes: Palette[];
}

const GROUP_IDS: { title: string; ids: string[] }[] = [
  { title: "Print", ids: ["risograph", "sepia", "cyanotype", "duotone-magenta", "mono-cream", "noir", "vintage"] },
  { title: "Retro screens", ids: ["gameboy", "gameboy-pocket", "nes", "c64", "apple2", "cga", "pico8", "zx-spectrum", "msx", "amber-crt", "green-crt"] },
  { title: "Mood", ids: ["sunset", "thermal", "forest", "arctic", "vaporwave", "neon"] },
];

const GROUPED_IDS = new Set(GROUP_IDS.flatMap((group) => group.ids));

const palettesFor = (ids: string[]): Palette[] =>
  ids.flatMap((id) => PALETTES.filter((palette) => palette.id === id));

const ungrouped = (): PaletteGroup[] => {
  const rest = PALETTES.filter((palette) => !GROUPED_IDS.has(palette.id));
  return rest.length > 0 ? [{ title: "More", palettes: rest }] : [];
};

export const PALETTE_GROUPS: PaletteGroup[] = [
  ...GROUP_IDS.map((group) => ({ title: group.title, palettes: palettesFor(group.ids) })),
  ...ungrouped(),
];
