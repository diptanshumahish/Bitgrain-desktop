import type { SelectOption } from "../../../../engine/style-types";
import { hexToRgbTriple, type RgbTriple } from "../../../../postfx/pixel-ops";

interface StudioPalette {
  id: string;
  label: string;
  colours: readonly string[];
}

export const SOURCE_PALETTE = "source";
export const EXTRACT_PALETTE = "extract";
export const DEFAULT_PALETTE = SOURCE_PALETTE;
export const FALLBACK_PALETTE = "acidPop";

const STUDIO_PALETTES: readonly StudioPalette[] = [
  { id: "acidPop", label: "Acid pop", colours: ["#F5E500", "#00B341", "#FFFFFF", "#0A6BFF", "#FF2DA0"] },
  { id: "cmykShock", label: "CMYK shock", colours: ["#00E8FF", "#FF00E1", "#FFF200", "#111111"] },
  { id: "yvesDots", label: "Yves blue", colours: ["#1738F0", "#F7F7FF"] },
  { id: "candyDots", label: "Candy", colours: ["#FF00C8", "#B01CFF", "#FFF200", "#FF4BA6", "#0EFFA3", "#FFFFFF"] },
  { id: "toxicGreen", label: "Toxic green", colours: ["#0DFF00", "#1E4BFF", "#FF1493", "#FFF200", "#000000"] },
  { id: "purplePop", label: "Purple pop", colours: ["#000000", "#D84BFF"] },
  { id: "nightDots", label: "Night", colours: ["#1536FF", "#0B8C4A", "#FF2DA0", "#FFFFFF"] },
  { id: "lemonade", label: "Lemonade", colours: ["#FF3D8A", "#FF7A00", "#FFD200", "#0DBE62", "#0A84FF"] },
  { id: "neonSunset", label: "Neon sunset", colours: ["#FF0055", "#FF6B00", "#FFD500", "#6B00FF", "#00FFD1"] },
  { id: "cottonCandy", label: "Cotton candy", colours: ["#FF9BE0", "#9BE8FF", "#C9FF4B", "#FFFFFF", "#FF4B4B"] },
  { id: "laserGrid", label: "Laser grid", colours: ["#0F0F2D", "#00F0FF", "#FF00A8", "#7BFF00", "#FFFFFF"] },
  { id: "vapor", label: "Vapor", colours: ["#3D0CFF", "#FF6AD5", "#00E5FF", "#FFF94B"] },
  { id: "heat", label: "Heat", colours: ["#FF2200", "#FF8800", "#FFEE00", "#FFFFFF"] },
  { id: "mono", label: "Mono", colours: ["#FFFFFF", "#888888", "#000000"] },
  { id: "blueprint", label: "Blueprint", colours: ["#0A2A6B", "#2E7CFF", "#B9D4FF", "#FFFFFF"] },
];

export const PALETTE_OPTIONS: readonly SelectOption[] = [
  { value: SOURCE_PALETTE, label: "Photo colours" },
  ...STUDIO_PALETTES.map((palette) => ({ value: palette.id, label: palette.label })),
  { value: EXTRACT_PALETTE, label: "Extract from image" },
];

const findPalette = (id: string): StudioPalette =>
  STUDIO_PALETTES.find((palette) => palette.id === id) ?? STUDIO_PALETTES[0];

export const paletteColours = (id: string): RgbTriple[] => findPalette(id).colours.map(hexToRgbTriple);
