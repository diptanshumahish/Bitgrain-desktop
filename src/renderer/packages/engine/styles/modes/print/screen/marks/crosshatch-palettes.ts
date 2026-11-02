import type { SelectOption } from "../../../../engine/style-types";

interface HatchPalette {
  id: string;
  label: string;
  ink: string;
  paper: string;
}

const HATCH_PALETTES: readonly HatchPalette[] = [
  { id: "drafting", label: "Drafting navy", ink: "#172044", paper: "#f2efe7" },
  { id: "graphite", label: "Graphite", ink: "#2b2b2b", paper: "#ffffff" },
  { id: "sepia", label: "Sepia", ink: "#5a3a22", paper: "#e6e2d6" },
  { id: "oxblood", label: "Oxblood", ink: "#7a1f2b", paper: "#d8c8a8" },
  { id: "newsprint", label: "Newsprint", ink: "#111111", paper: "#d9d6cc" },
  { id: "chalkboard", label: "Chalkboard", ink: "#e8e4d8", paper: "#1a1a1e" },
  { id: "blueLine", label: "Blue line", ink: "#2f6fd0", paper: "#f4f7ff" },
];

export const HATCH_PALETTE_OPTIONS: readonly SelectOption[] = HATCH_PALETTES.map((palette) => ({ value: palette.id, label: palette.label }));

export const hatchPaletteFor = (id: string): HatchPalette => HATCH_PALETTES.find((palette) => palette.id === id) ?? HATCH_PALETTES[0];
