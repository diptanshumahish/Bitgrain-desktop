import { hexToRgbTriple, type RgbTriple } from "../../../postfx/pixel-ops";

interface GradientPalette {
  label: string;
  stops: readonly string[];
}

export const GRADIENT_PALETTES: Readonly<Record<string, GradientPalette>> = {
  inferno: { label: "Inferno", stops: ["#000004", "#280b54", "#65156e", "#9f2a63", "#d44842", "#f57d15", "#fac127", "#fcffa4"] },
  magma: { label: "Magma", stops: ["#000004", "#280b54", "#65156e", "#b73779", "#f06e78", "#feb482", "#fcfdbf"] },
  viridis: { label: "Viridis", stops: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"] },
  sunset: { label: "Sunset", stops: ["#141036", "#562068", "#ad3669", "#f06e50", "#ffbe5a"] },
  tealorange: { label: "Teal and orange", stops: ["#081e2c", "#124a5c", "#96968c", "#e0965a", "#fad28c"] },
  cyberpunk: { label: "Cyberpunk", stops: ["#0c041e", "#780a78", "#dc148c", "#50c8e6", "#c8ffff"] },
  gold: { label: "Gold", stops: ["#100a04", "#462a14", "#96642c", "#d6a65c", "#fae8b4"] },
  noir: { label: "Noir", stops: ["#080a14", "#3c4256", "#969cac", "#ebeef5"] },
};

export const DEFAULT_PALETTE = "inferno";

export const paletteOptions = (): { value: string; label: string }[] =>
  Object.entries(GRADIENT_PALETTES).map(([value, palette]) => ({ value, label: palette.label }));

const paletteStops = (key: string): RgbTriple[] =>
  (GRADIENT_PALETTES[key] ?? GRADIENT_PALETTES[DEFAULT_PALETTE]).stops.map(hexToRgbTriple);

const paletteColourAt = (stops: readonly RgbTriple[], position: number): RgbTriple => {
  const scaled = Math.min(1, Math.max(0, position)) * (stops.length - 1);
  const lower = Math.min(stops.length - 2, Math.floor(scaled));
  const blend = scaled - lower;
  const from = stops[lower];
  const to = stops[lower + 1];
  return [from[0] + (to[0] - from[0]) * blend, from[1] + (to[1] - from[1]) * blend, from[2] + (to[2] - from[2]) * blend];
};

export const paletteRamp = (key: string, entries: number): Float32Array => {
  const stops = paletteStops(key);
  const ramp = new Float32Array(entries * 3);
  for (let entry = 0; entry < entries; entry++) ramp.set(paletteColourAt(stops, entry / (entries - 1)), entry * 3);
  return ramp;
};
