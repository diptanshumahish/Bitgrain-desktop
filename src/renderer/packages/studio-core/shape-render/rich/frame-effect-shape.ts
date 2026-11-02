import type { FrameLayer, ShapeLayer } from "../../model/studio-types";
import type { LayerEffect } from "../../model/layer-paint-types";
import { visibleEffects } from "../paint-list/read-paints";

const EMPTY_BACKGROUNDS = ["", "transparent", "none"];

export const frameShapeEffects = (frame: FrameLayer): LayerEffect[] | undefined => {
  const effects = visibleEffects(frame.layerEffects).filter((effect) => effect.kind !== "layer-blur");
  return effects.length > 0 ? effects : undefined;
};

export const frameEffectShape = (frame: FrameLayer): ShapeLayer | null => {
  const effects = frameShapeEffects(frame);
  if (!effects || EMPTY_BACKGROUNDS.includes(frame.background)) return null;
  return {
    id: `${frame.id}-bg`,
    type: "shape",
    shapeType: "rect",
    name: "Frame background",
    x: 0,
    y: 0,
    width: frame.width,
    height: frame.height,
    fill: frame.background,
    stroke: "transparent",
    strokeWidth: 0,
    borderRadius: 0,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    layerEffects: effects,
  };
};

export const frameOwnsOpacity = (frame: FrameLayer): boolean =>
  frameEffectShape(frame) !== null && (frameShapeEffects(frame) ?? []).some((effect) => effect.kind === "background-blur");
