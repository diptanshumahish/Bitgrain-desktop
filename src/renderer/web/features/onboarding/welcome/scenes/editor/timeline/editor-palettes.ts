import type { EditorPalette } from "./editor-frame-store";

interface PaletteColors {
  paper: string;
  primary: string;
  secondary: string;
  ink: string;
}

const PALETTE_COLORS: Record<EditorPalette, PaletteColors> = {
  primaries: { paper: "#EFE8DA", primary: "#D93A2B", secondary: "#EAB43E", ink: "#171717" },
  cobalt: { paper: "#F1ECE4", primary: "#2C45D3", secondary: "#F3A98C", ink: "#14143A" },
};

export const PALETTE_NAMES: Record<EditorPalette, string> = { primaries: "Bauhaus primaries", cobalt: "Cobalt peach" };

const BASE_COLORS = PALETTE_COLORS.primaries;

export const recolour = (color: string, palette: EditorPalette): string => {
  const role = (Object.keys(BASE_COLORS) as (keyof PaletteColors)[]).find((key) => BASE_COLORS[key] === color);
  return role ? PALETTE_COLORS[palette][role] : color;
};
