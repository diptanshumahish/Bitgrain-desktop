import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { fitTextBox } from "@bitgrain/studio-core/layers/studio-layers";

const centerOffset = (baseStart: number, baseSize: number, size: number): number =>
  Math.round(baseStart + baseSize / 2 - size / 2);

export const applyRememberedTextStyle = (base: TextLayer, style: Partial<TextLayer> | null): TextLayer => {
  if (!style) return base;
  const styled: TextLayer = { ...base, ...structuredClone(style) };
  const fit = fitTextBox(styled);
  return {
    ...styled,
    width: fit.width,
    height: fit.height,
    x: centerOffset(base.x, base.width, fit.width),
    y: centerOffset(base.y, base.height, fit.height),
  };
};
