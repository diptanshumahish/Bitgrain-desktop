import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isStyleKey, type CopiedLayerStyle, type LayerStyle } from "./extract-layer-style";
import { fillKeysFor } from "./style-fill";

const SHARED_STYLE_KEYS = ["opacity", "blendMode"];

const sharedStyle = (style: LayerStyle, target: Layer): LayerStyle =>
  Object.fromEntries(
    Object.entries(style).filter(([key]) => SHARED_STYLE_KEYS.includes(key) || key in target),
  );

const mappedFill = (copied: CopiedLayerStyle, target: Layer): LayerStyle => {
  const sourceKeys = fillKeysFor(copied.sourceType);
  const targetKeys = fillKeysFor(target.type);
  if (!sourceKeys || !targetKeys) return {};
  const color = copied.style[sourceKeys.color];
  if (typeof color !== "string") return {};
  return { [targetKeys.color]: color, [targetKeys.variable]: copied.style[sourceKeys.variable] };
};

const clearedStyle = (style: LayerStyle, target: Layer): LayerStyle =>
  Object.fromEntries(
    Object.keys(target).filter((key) => isStyleKey(key, target.type) && !(key in style)).map((key) => [key, undefined]),
  );

export const styleUpdatesFor = (copied: CopiedLayerStyle, target: Layer): Partial<Layer> => {
  const style = structuredClone(copied.style);
  if (copied.sourceType === target.type) return { ...clearedStyle(style, target), ...style } as Partial<Layer>;
  return { ...sharedStyle(style, target), ...mappedFill(copied, target) } as Partial<Layer>;
};
