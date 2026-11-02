import type { LayerEffect, LayerEffectKind } from "../../model/layer-paint-types";
import { visibleEffects } from "../paint-list/read-paints";
import { innerShadowFilter } from "../rich/passes/effect-filters";
import { svgNode, type SvgNode } from "../svg-node/svg-node";
import { svgSafeId } from "../svg-id";

export interface ImageLayerFx {
  inner: LayerEffect[];
  blur: number;
  backdrop: number;
}

const largestOf = (effects: LayerEffect[], kind: LayerEffectKind): number =>
  Math.max(0, ...effects.filter((effect) => effect.kind === kind).map((effect) => effect.blur));

export const imageLayerFx = (effects: LayerEffect[] | undefined): ImageLayerFx => {
  const visible = visibleEffects(effects);
  return {
    inner: visible.filter((effect) => effect.kind === "inner-shadow"),
    blur: largestOf(visible, "layer-blur"),
    backdrop: largestOf(visible, "background-blur"),
  };
};

export const hasImageFx = (fx: ImageLayerFx): boolean => fx.inner.length > 0 || fx.blur > 0 || fx.backdrop > 0;

export const innerShadowFilterId = (layerId: string): string => `img-is-${svgSafeId(layerId)}`;

const withSourceOnBottom = (filter: SvgNode): SvgNode => {
  const children = filter.children ?? [];
  const merge = children[children.length - 1];
  const sourceNode = svgNode("feMergeNode", { in: "SourceGraphic" });
  return { ...filter, children: [...children.slice(0, -1), svgNode("feMerge", {}, [sourceNode, ...(merge?.children ?? [])])] };
};

export const imageInnerShadowFilter = (layerId: string, fx: ImageLayerFx, width: number, height: number): SvgNode =>
  withSourceOnBottom(innerShadowFilter(innerShadowFilterId(layerId), fx.inner, { x: 0, y: 0, width, height }));
