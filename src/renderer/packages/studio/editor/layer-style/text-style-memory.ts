import type { Layer, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { extractLayerStyle } from "./extract-layer-style";

const BOX_SIZING_KEYS = ["sizing", "maxLines"];

let rememberedTextStyle: Partial<TextLayer> | null = null;

const textStyleOf = (layer: TextLayer): Partial<TextLayer> => {
  const { style } = extractLayerStyle(layer);
  return Object.fromEntries(Object.entries(style).filter(([key]) => !BOX_SIZING_KEYS.includes(key)));
};

export const rememberTextStyleFrom = (selected: Layer[]): void => {
  if (selected.length === 0) return;
  const [first] = selected;
  if (selected.length === 1 && first.type === "text") {
    rememberedTextStyle = textStyleOf(first);
    return;
  }
  if (selected.some((layer) => layer.type !== "text")) rememberedTextStyle = null;
};

export const readRememberedTextStyle = (): Partial<TextLayer> | null => rememberedTextStyle;
