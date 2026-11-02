import { hexToRgbTriple, type RgbTriple } from "../../../postfx/pixel-ops";

interface DustPalette {
  label: string;
  background: string;
  ramp?: readonly [string, string, string];
}

const DUST_COLOURS: Readonly<Record<string, DustPalette>> = {
  source: { label: "Photo colours", background: "#05060a" },
  mono: { label: "Monochrome", background: "#000000" },
  moonlight: { label: "Moonlight", background: "#04060f", ramp: ["#0c1e4e", "#3f6fd8", "#dfe9ff"] },
  rose: { label: "Rose", background: "#12040a", ramp: ["#5a102e", "#d84f7f", "#ffe3ec"] },
  amber: { label: "Amber", background: "#100a02", ramp: ["#5c340c", "#e0902f", "#fff2d8"] },
  mint: { label: "Mint", background: "#03100c", ramp: ["#0a4e36", "#35c58a", "#e0fff2"] },
  violet: { label: "Violet", background: "#0a0412", ramp: ["#3a0c68", "#9a4fd8", "#f0e3ff"] },
};

export const DEFAULT_DUST_COLOURS = "source";

export const dustPalette = (key: string): DustPalette => DUST_COLOURS[key] ?? DUST_COLOURS[DEFAULT_DUST_COLOURS];

export const dustColourOptions = (): { value: string; label: string }[] =>
  Object.entries(DUST_COLOURS).map(([value, palette]) => ({ value, label: palette.label }));

export const dustRamp = (palette: DustPalette): readonly RgbTriple[] | null =>
  palette.ramp ? palette.ramp.map(hexToRgbTriple) : null;
