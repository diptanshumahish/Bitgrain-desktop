import type { SelectOption } from "../../../../engine/style-types";
import { buildGradientLut, type GradientStop } from "../../shared/gradient-lut";

export const THERMAL_PALETTE_OPTIONS: readonly SelectOption[] = [
  { value: "rainbow", label: "Medical" },
  { value: "ironbow", label: "Ironbow" },
  { value: "whitehot", label: "White hot" },
  { value: "blackhot", label: "Black hot" },
  { value: "lava", label: "Lava" },
  { value: "arctic", label: "Arctic" },
];

const PALETTE_STOPS: Readonly<Record<string, readonly GradientStop[]>> = {
  rainbow: [
    { at: 0, hex: "#001a55" }, { at: 0.18, hex: "#0b3fd4" }, { at: 0.35, hex: "#00a3d9" }, { at: 0.5, hex: "#1fb84d" },
    { at: 0.65, hex: "#b6e02a" }, { at: 0.78, hex: "#ffd21a" }, { at: 0.9, hex: "#ff5a1a" }, { at: 1, hex: "#ffffff" },
  ],
  ironbow: [
    { at: 0, hex: "#000000" }, { at: 0.13, hex: "#10023a" }, { at: 0.28, hex: "#4a0a6b" }, { at: 0.42, hex: "#8f1a5a" },
    { at: 0.55, hex: "#d21e3c" }, { at: 0.68, hex: "#f5511e" }, { at: 0.8, hex: "#ff9500" }, { at: 0.9, hex: "#ffe23d" },
    { at: 1, hex: "#ffffff" },
  ],
  whitehot: [{ at: 0, hex: "#000000" }, { at: 1, hex: "#ffffff" }],
  blackhot: [{ at: 0, hex: "#ffffff" }, { at: 1, hex: "#000000" }],
  lava: [
    { at: 0, hex: "#000000" }, { at: 0.3, hex: "#4a0000" }, { at: 0.55, hex: "#c21807" },
    { at: 0.75, hex: "#ff6f00" }, { at: 0.9, hex: "#ffd000" }, { at: 1, hex: "#fffde0" },
  ],
  arctic: [
    { at: 0, hex: "#00111f" }, { at: 0.3, hex: "#062f5c" }, { at: 0.55, hex: "#0a6fb5" },
    { at: 0.75, hex: "#4fc3f7" }, { at: 0.9, hex: "#b3e5fc" }, { at: 1, hex: "#ffffff" },
  ],
};

const LUTS = new Map(Object.entries(PALETTE_STOPS).map(([key, stops]) => [key, buildGradientLut(stops)]));

export const thermalLut = (palette: string): Uint8ClampedArray => LUTS.get(palette) ?? (LUTS.get("rainbow") as Uint8ClampedArray);
