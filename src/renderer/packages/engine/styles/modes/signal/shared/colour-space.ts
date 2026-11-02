import { hexToRgbTriple } from "../../../postfx/pixel-ops";
import { BYTE_MAX } from "./signal-math";

export type UnitColour = [number, number, number];

export const unitColourFromHex = (hex: string): UnitColour => {
  const [red, green, blue] = hexToRgbTriple(hex);
  return [red / BYTE_MAX, green / BYTE_MAX, blue / BYTE_MAX];
};
