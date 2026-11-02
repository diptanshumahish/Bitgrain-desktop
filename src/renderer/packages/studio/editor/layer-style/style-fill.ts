import type { LayerType } from "@bitgrain/studio-core/model/studio-types";

interface FillKeys {
  color: string;
  variable: string;
}

const FILL_KEYS_BY_TYPE: Partial<Record<LayerType, FillKeys>> = {
  shape: { color: "fill", variable: "fillVar" },
  vector: { color: "fill", variable: "fillVar" },
  text: { color: "color", variable: "colorVar" },
  ink: { color: "color", variable: "colorVar" },
  frame: { color: "background", variable: "backgroundVar" },
};

export const fillKeysFor = (type: LayerType): FillKeys | undefined => FILL_KEYS_BY_TYPE[type];

export const readFill = (type: LayerType, values: Record<string, unknown>): unknown => {
  const keys = fillKeysFor(type);
  return keys ? values[keys.color] : undefined;
};
