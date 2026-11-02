import type { ColorVariable, TextStyleVariable } from "@bitgrain/studio-core/model/design-kit-types";
import { isSolidColor, oklabDistance, toOklab } from "./kit-color-space";

export const nearestKitColor = (value: string, colors: ColorVariable[]): ColorVariable | null => {
  const target = toOklab(value);
  let best: ColorVariable | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const color of colors) {
    if (!isSolidColor(color.value)) continue;
    const distance = oklabDistance(target, toOklab(color.value));
    if (distance < bestDistance) {
      best = color;
      bestDistance = distance;
    }
  }
  return best;
};

export const nearestTextStyle = (fontSize: number, styles: TextStyleVariable[]): TextStyleVariable | null => {
  let best: TextStyleVariable | null = null;
  for (const style of styles) {
    if (!best || Math.abs(style.fontSize - fontSize) < Math.abs(best.fontSize - fontSize)) best = style;
  }
  return best;
};
