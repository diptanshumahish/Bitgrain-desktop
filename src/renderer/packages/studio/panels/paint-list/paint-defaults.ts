import type { LayerEffect, LayerEffectKind, LayerFill, LayerFillKind, LayerStroke } from "@bitgrain/studio-core/model/layer-paint-types";
import type { PanelBox } from "../paint/gradient-defaults";
import { createGradient } from "../paint/gradient-defaults";
import { DEFAULT_GRAIN } from "@bitgrain/studio-core/shape-render/rich/passes/grain-filter";

const DEFAULT_FILL_COLOR = "#d9d9d9";
const DEFAULT_STROKE_COLOR = "#141414";
const DEFAULT_STROKE_WIDTH = 2;
const SHADOW_COLOR = "#00000040";
const DEFAULT_BLUR_RADIUS = 8;
const GRAIN_OPACITY = 0.35;
const GLOW_BLUR = 16;
const GLOW_COLOR = "#ffd60a";

const newId = (): string => crypto.randomUUID();

export const newFill = (color: string = DEFAULT_FILL_COLOR): LayerFill => ({
  id: newId(),
  kind: "solid",
  color,
  opacity: 1,
  visible: true,
});

export const switchFillKind = (fill: LayerFill, kind: LayerFillKind, box: PanelBox): LayerFill => {
  if (kind === "gradient") return { ...fill, kind, gradient: fill.gradient ?? createGradient("linear", fill.color, box) };
  if (kind === "grain") {
    return { ...fill, kind, grain: fill.grain ?? DEFAULT_GRAIN, blendMode: fill.blendMode ?? "overlay", opacity: fill.grain ? fill.opacity : GRAIN_OPACITY };
  }
  return { ...fill, kind };
};

export const newStroke = (): LayerStroke => ({
  id: newId(),
  color: DEFAULT_STROKE_COLOR,
  width: DEFAULT_STROKE_WIDTH,
  align: "inside",
  opacity: 1,
  visible: true,
});

const EFFECT_SHAPES: Record<LayerEffectKind, Omit<LayerEffect, "id" | "kind" | "visible">> = {
  "drop-shadow": { x: 0, y: 4, blur: 12, spread: 0, color: SHADOW_COLOR },
  "inner-shadow": { x: 0, y: 4, blur: 8, spread: 0, color: SHADOW_COLOR },
  glow: { x: 0, y: 0, blur: GLOW_BLUR, spread: 0, color: GLOW_COLOR },
  "layer-blur": { x: 0, y: 0, blur: DEFAULT_BLUR_RADIUS, spread: 0, color: SHADOW_COLOR },
  "background-blur": { x: 0, y: 0, blur: DEFAULT_BLUR_RADIUS, spread: 0, color: SHADOW_COLOR },
};

export const newEffect = (kind: LayerEffectKind = "drop-shadow"): LayerEffect => ({ id: newId(), kind, visible: true, ...EFFECT_SHAPES[kind] });

export const switchEffectKind = (effect: LayerEffect, kind: LayerEffectKind): LayerEffect => {
  const isShadow = (value: LayerEffectKind): boolean => value === "drop-shadow" || value === "inner-shadow" || value === "glow";
  if (isShadow(kind) === isShadow(effect.kind)) return { ...effect, kind };
  return { ...effect, ...EFFECT_SHAPES[kind], kind };
};
