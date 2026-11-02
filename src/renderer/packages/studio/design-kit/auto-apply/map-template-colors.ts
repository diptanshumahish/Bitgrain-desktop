import type { ColorVariable } from "@bitgrain/studio-core/model/design-kit-types";
import { colorKey, oklabDistance } from "../palette/kit-color-space";
import type { KitColorChoice } from "../palette/layer-colors";
import {
  ACCENT_CHROMA_MIN,
  byChroma,
  byLightness,
  kitColorRoles,
  rankColor,
  type RankedColor,
} from "./kit-color-roles";

export type KitColorMap = Map<string, KitColorChoice>;

type Distance = (first: RankedColor, second: RankedColor) => number;

const perceptualDistance: Distance = (first, second) => oklabDistance(first.lab, second.lab);

const lightnessDistance: Distance = (first, second) => Math.abs(first.lab.lightness - second.lab.lightness);

const nearestBy = (color: RankedColor, pool: RankedColor[], distance: Distance): RankedColor =>
  pool.reduce((best, candidate) => (distance(color, candidate) < distance(color, best) ? candidate : best));

const neutralTarget = (color: RankedColor, rank: number, count: number, ramp: RankedColor[]): RankedColor => {
  if (count === 1) return nearestBy(color, ramp, perceptualDistance);
  if (rank === 0) return ramp[0];
  if (rank === count - 1) return ramp[ramp.length - 1];
  return nearestBy(color, ramp, lightnessDistance);
};

const accentTarget = (color: RankedColor, rank: number, accents: RankedColor[], ramp: RankedColor[]): RankedColor => {
  if (accents.length === 0) return nearestBy(color, ramp, perceptualDistance);
  return rank < accents.length ? accents[rank] : nearestBy(color, accents, perceptualDistance);
};

const toChoice = (color: RankedColor): KitColorChoice => ({ id: color.id, value: color.value });

export const buildKitColorMap = (templateValues: string[], kitColors: ColorVariable[]): KitColorMap => {
  const map: KitColorMap = new Map();
  const { ramp, accents } = kitColorRoles(kitColors);
  if (ramp.length === 0) return map;
  const unique = [...new Set(templateValues.map(colorKey))].map((key) => rankColor(key, key));
  const neutrals = unique.filter((color) => color.chroma < ACCENT_CHROMA_MIN).sort(byLightness);
  const chromatic = unique.filter((color) => color.chroma >= ACCENT_CHROMA_MIN).sort(byChroma);
  neutrals.forEach((color, rank) => map.set(color.id, toChoice(neutralTarget(color, rank, neutrals.length, ramp))));
  chromatic.forEach((color, rank) => map.set(color.id, toChoice(accentTarget(color, rank, accents, ramp))));
  return map;
};
