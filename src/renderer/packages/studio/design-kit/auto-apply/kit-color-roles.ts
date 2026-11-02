import type { ColorVariable } from "@bitgrain/studio-core/model/design-kit-types";
import { chromaOf, isSolidColor, toOklab, type OklabColor } from "../palette/kit-color-space";

export const ACCENT_CHROMA_MIN = 0.06;

export interface RankedColor {
  id: string;
  value: string;
  lab: OklabColor;
  chroma: number;
}

interface KitColorRoles {
  ramp: RankedColor[];
  accents: RankedColor[];
}

export const rankColor = (id: string, value: string): RankedColor => {
  const lab = toOklab(value);
  return { id, value, lab, chroma: chromaOf(lab) };
};

export const byLightness = (first: RankedColor, second: RankedColor): number =>
  first.lab.lightness - second.lab.lightness || first.id.localeCompare(second.id);

export const byChroma = (first: RankedColor, second: RankedColor): number =>
  second.chroma - first.chroma || first.id.localeCompare(second.id);

export const kitColorRoles = (colors: ColorVariable[]): KitColorRoles => {
  const ordered = colors
    .filter((color) => isSolidColor(color.value))
    .map((color) => rankColor(color.id, color.value))
    .sort(byLightness);
  const middle = ordered.slice(1, -1);
  const accents = middle.filter((color) => color.chroma >= ACCENT_CHROMA_MIN).sort(byChroma);
  const ramp = ordered.filter((color) => !accents.includes(color));
  return { ramp, accents };
};
