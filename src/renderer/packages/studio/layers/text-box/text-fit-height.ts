import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { halfLeading } from "@bitgrain/core/layout/text-block-height";
import { prepareProbe } from "./text-measure-probe";

const MIN_HUG_WIDTH = 24;
const HUG_PADDING = 4;
const LEADING_SIDES = 2;

interface TextBoxSize {
  width: number;
  height: number;
}

const trimmedHeight = (element: HTMLDivElement, layer: TextLayer): number => {
  const leading = halfLeading(layer.fontSize, layer.lineHeight) * LEADING_SIDES;
  return Math.ceil(element.getBoundingClientRect().height - leading);
};

export const fittedTextHeight = (layer: TextLayer): number => {
  const element = prepareProbe(layer, `${layer.width}px`, "pre-wrap");
  return trimmedHeight(element, layer);
};

export const huggedTextSize = (layer: TextLayer): TextBoxSize => {
  const element = prepareProbe(layer, "max-content", "pre");
  const width = Math.ceil(element.getBoundingClientRect().width) + HUG_PADDING;
  return { width: Math.max(MIN_HUG_WIDTH, width), height: trimmedHeight(element, layer) };
};
