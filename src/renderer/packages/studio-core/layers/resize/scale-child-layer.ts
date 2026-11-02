import type { Layer } from "../../model/studio-types";
import type { LayoutPadding } from "../../model/auto-layout-types";
import { scaleTextEffects } from "./scale-text-effects";

export interface ScaleFactors {
  x: number;
  y: number;
  uniform: number;
}

const scaleBox = (layer: Layer, factors: ScaleFactors): Layer => ({
  ...layer,
  x: layer.x * factors.x,
  y: layer.y * factors.y,
  width: layer.width * factors.x,
  height: layer.height * factors.y,
});

const scalePaddingSides = (sides: LayoutPadding | undefined, uniform: number): LayoutPadding | undefined =>
  sides && {
    top: sides.top * uniform,
    right: sides.right * uniform,
    bottom: sides.bottom * uniform,
    left: sides.left * uniform,
  };

const scaleOptional = (value: number | undefined, uniform: number): number | undefined =>
  value === undefined ? undefined : value * uniform;

export const scaleChildLayer = (layer: Layer, factors: ScaleFactors): Layer => {
  const box = scaleBox(layer, factors);
  const uniform = factors.uniform;
  switch (box.type) {
    case "text":
      return {
        ...box,
        fontSize: box.fontSize * uniform,
        letterSpacing: box.letterSpacing * uniform,
        effects: scaleTextEffects(box.effects, uniform),
      };
    case "shape":
      return { ...box, strokeWidth: box.strokeWidth * uniform, borderRadius: box.borderRadius * uniform };
    case "upload":
      return { ...box, borderRadius: box.borderRadius * uniform };
    case "vector":
      return { ...box, strokeWidth: box.strokeWidth * uniform };
    case "group":
      return {
        ...box,
        gap: box.gap * uniform,
        padding: box.padding * uniform,
        paddingSides: scalePaddingSides(box.paddingSides, uniform),
        layers: box.layers.map((child) => scaleChildLayer(child, factors)),
      };
    case "frame":
      return {
        ...box,
        gap: scaleOptional(box.gap, uniform),
        padding: scaleOptional(box.padding, uniform),
        paddingSides: scalePaddingSides(box.paddingSides, uniform),
        layers: box.layers.map((child) => scaleChildLayer(child, factors)),
      };
    default:
      return box;
  }
};
