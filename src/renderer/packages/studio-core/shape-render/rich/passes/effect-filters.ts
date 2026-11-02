import type { LayerEffect } from "../../../model/layer-paint-types";
import { svgNode, type SvgNode } from "../../svg-node/svg-node";
import { parseColor, rgbHex } from "../../paint/color-parse";

const SHADOW_SIGMA_RATIO = 0.5;

export interface FilterRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const filterShell = (id: string, region: FilterRegion, children: SvgNode[]): SvgNode =>
  svgNode("filter", { id, filterUnits: "userSpaceOnUse", ...region, colorInterpolationFilters: "sRGB" }, children);

const floodNodes = (color: string, shapeResult: string, result: string, operator: string): SvgNode[] => {
  const rgba = parseColor(color);
  return [
    svgNode("feFlood", { floodColor: rgbHex(rgba), floodOpacity: rgba.a, result: `${result}c` }),
    svgNode("feComposite", { in: `${result}c`, in2: shapeResult, operator, result }),
  ];
};

const spreadNode = (input: string, spread: number, result: string): SvgNode =>
  svgNode("feMorphology", { in: input, operator: spread > 0 ? "dilate" : "erode", radius: Math.abs(spread), result });

const blurNode = (input: string, blur: number, result: string): SvgNode =>
  svgNode("feGaussianBlur", { in: input, stdDeviation: blur * SHADOW_SIGMA_RATIO, result });

const dropShadowNodes = (effect: LayerEffect, index: number): SvgNode[] => {
  const key = `ds${index}`;
  const spread = effect.spread !== 0 ? [spreadNode("SourceAlpha", effect.spread, `${key}m`)] : [];
  const spreadOut = spread.length > 0 ? `${key}m` : "SourceAlpha";
  return [
    ...spread,
    blurNode(spreadOut, effect.blur, `${key}b`),
    svgNode("feOffset", { in: `${key}b`, dx: effect.x, dy: effect.y, result: `${key}o` }),
    ...floodNodes(effect.color, `${key}o`, key, "in"),
  ];
};

const innerShadowNodes = (effect: LayerEffect, index: number): SvgNode[] => {
  const key = `is${index}`;
  const spread = effect.spread > 0 ? [spreadNode(`${key}o`, -effect.spread, `${key}m`)] : [];
  const spreadOut = spread.length > 0 ? `${key}m` : `${key}o`;
  return [
    svgNode("feOffset", { in: "SourceAlpha", dx: effect.x, dy: effect.y, result: `${key}o` }),
    ...spread,
    blurNode(spreadOut, effect.blur, `${key}b`),
    svgNode("feComposite", { in: "SourceAlpha", in2: `${key}b`, operator: "out", result: `${key}k` }),
    ...floodNodes(effect.color, `${key}k`, key, "in"),
  ];
};

const mergeNode = (prefix: string, count: number): SvgNode =>
  svgNode("feMerge", {}, Array.from({ length: count }, (_, index) => svgNode("feMergeNode", { in: `${prefix}${index}` })));

export const dropShadowFilter = (id: string, effects: LayerEffect[], region: FilterRegion): SvgNode =>
  filterShell(id, region, [...effects.flatMap(dropShadowNodes), mergeNode("ds", effects.length)]);

export const innerShadowFilter = (id: string, effects: LayerEffect[], region: FilterRegion): SvgNode =>
  filterShell(id, region, [...effects.flatMap(innerShadowNodes), mergeNode("is", effects.length)]);

export const layerBlurFilter = (id: string, radius: number, region: FilterRegion): SvgNode =>
  filterShell(id, region, [svgNode("feGaussianBlur", { in: "SourceGraphic", stdDeviation: radius })]);

export const shadowSigma = (blur: number): number => blur * SHADOW_SIGMA_RATIO;
