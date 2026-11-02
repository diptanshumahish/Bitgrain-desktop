import { mixValue, smoothRange } from "../../shared/signal-math";
import { unitColourFromHex, type UnitColour } from "../../shared/colour-space";

const RGB = 3;

export const DEFAULT_INKS: readonly string[] = ["#100a1e", "#7a2ea8", "#ff6a3d", "#ffe9c7"];

export const INK_KEYS: readonly string[] = ["ink1", "ink2", "ink3", "ink4"];

export const inkRamp = (hexes: readonly string[]): readonly UnitColour[] => hexes.map(unitColourFromHex);

export const mapThroughInks = (inks: readonly UnitColour[], luma: number, amount: number, colour: UnitColour): void => {
  const position = Math.min(1, Math.max(0, luma)) * (inks.length - 1);
  const segment = Math.min(inks.length - 2, Math.floor(position));
  const blend = smoothRange(0, 1, position - segment);
  for (let channel = 0; channel < RGB; channel++) {
    const mapped = mixValue(inks[segment][channel], inks[segment + 1][channel], blend);
    colour[channel] = mixValue(colour[channel], mapped, amount);
  }
};
