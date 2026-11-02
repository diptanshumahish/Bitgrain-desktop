import type { SelectOption } from "../../../../engine/style-types";
import { hexToRgbTriple } from "../../../../postfx/pixel-ops";

interface DitherPalette {
  id: string;
  label: string;
  colours: readonly string[];
}

const GREY_EIGHT = ["#000000", "#242424", "#494949", "#6d6d6d", "#929292", "#b6b6b6", "#dbdbdb", "#ffffff"];

export const ORIGINAL_PALETTE_ID = "original";

const DITHER_PALETTES: readonly DitherPalette[] = [
  { id: "mono", label: "Mono 1-bit", colours: ["#000000", "#ffffff"] },
  { id: "grey4", label: "Grey, 4 levels", colours: ["#000000", "#555555", "#aaaaaa", "#ffffff"] },
  { id: "grey8", label: "Grey, 8 levels", colours: GREY_EIGHT },
  { id: "gameboy", label: "Game Boy", colours: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"] },
  { id: "cga0", label: "CGA palette 0", colours: ["#000000", "#55ff55", "#ff5555", "#ffff55"] },
  { id: "cga1", label: "CGA palette 1", colours: ["#000000", "#55ffff", "#ff55ff", "#ffffff"] },
  { id: "pico8", label: "Pico-8", colours: ["#000000", "#1d2b53", "#7e2553", "#008751", "#ab5236", "#5f574f", "#c2c3c7", "#fff1e8", "#ff004d", "#ffa300", "#ffec27", "#00e436", "#29adff", "#83769c", "#ff77a8", "#ffccaa"] },
  { id: "c64", label: "C64", colours: ["#000000", "#ffffff", "#880000", "#aaffee", "#cc44cc", "#00cc55", "#0000aa", "#eeee77", "#dd8855", "#664400", "#ff7777", "#333333", "#777777", "#aaff66", "#0088ff", "#bbbbbb"] },
  { id: "nes16", label: "NES", colours: ["#000000", "#7c7c7c", "#0000fc", "#0000bc", "#4428bc", "#940084", "#a80020", "#a81000", "#881400", "#503000", "#007800", "#006800", "#005800", "#004058", "#fcfcfc", "#f8b800"] },
  { id: "rgb3", label: "3-bit RGB", colours: ["#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff"] },
  { id: "cyberpunk", label: "Cyberpunk", colours: ["#0d0221", "#ff2a6d", "#05d9e8", "#d1f7ff"] },
  { id: "pastel", label: "Pastel", colours: ["#2b2d42", "#8d99ae", "#ef8354", "#f6bd60", "#f7ede2", "#84a59d"] },
  { id: "riso", label: "Risograph", colours: ["#2a2a2a", "#ff4858", "#ffd23f", "#1b9aaa", "#f6f4e6"] },
  { id: "sepia", label: "Sepia", colours: ["#2b1d0e", "#6b4f2a", "#b08d57", "#e8d8b0"] },
  { id: ORIGINAL_PALETTE_ID, label: "Original colours", colours: ["#000000", "#ffffff"] },
];

export const DITHER_PALETTE_OPTIONS: readonly SelectOption[] = DITHER_PALETTES.map((palette) => ({ value: palette.id, label: palette.label }));

export const ditherPaletteRgb = (id: string): Float32Array => {
  const palette = DITHER_PALETTES.find((entry) => entry.id === id) ?? DITHER_PALETTES[0];
  return new Float32Array(palette.colours.flatMap((hex) => hexToRgbTriple(hex)));
};
