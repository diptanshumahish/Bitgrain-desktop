import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { TextStyleVariable } from "@bitgrain/studio-core/model/design-kit-types";
import { nearestTextStyle } from "../palette/nearest-kit-token";
import { withKitFont } from "../palette/kit-font-update";

type KitTextMap = Map<number, TextStyleVariable>;

const TOP_OF_SCALE = 1;

const scalePosition = (size: number, smallest: number, largest: number): number =>
  largest <= smallest ? TOP_OF_SCALE : (Math.log(size) - Math.log(smallest)) / (Math.log(largest) - Math.log(smallest));

const sizeBounds = (sizes: number[]): [number, number] => [Math.min(...sizes), Math.max(...sizes)];

const largestFirst = (first: TextStyleVariable, second: TextStyleVariable): number =>
  second.fontSize - first.fontSize || first.id.localeCompare(second.id);

const styleAtPosition = (position: number, styles: TextStyleVariable[]): TextStyleVariable => {
  const [smallest, largest] = sizeBounds(styles.map((style) => style.fontSize));
  const gap = (style: TextStyleVariable): number => Math.abs(scalePosition(style.fontSize, smallest, largest) - position);
  return styles.reduce((best, style) => (gap(style) < gap(best) ? style : best));
};

export const buildKitTextMap = (fontSizes: number[], styles: TextStyleVariable[]): KitTextMap => {
  const map: KitTextMap = new Map();
  const sizes = [...new Set(fontSizes.filter((size) => size > 0))];
  if (styles.length === 0 || sizes.length === 0) return map;
  const ordered = [...styles].sort(largestFirst);
  const [smallest, largest] = sizeBounds(sizes);
  for (const size of sizes) {
    const style = sizes.length === 1 ? nearestTextStyle(size, ordered) : styleAtPosition(scalePosition(size, smallest, largest), ordered);
    if (style) map.set(size, style);
  }
  return map;
};

export const restyleTextLayer = (layer: Layer, map: KitTextMap): Layer => {
  if (layer.type !== "text") return layer;
  const style = map.get(layer.fontSize);
  return style ? withKitFont(layer, style) : layer;
};
