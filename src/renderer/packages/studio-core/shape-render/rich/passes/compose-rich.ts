import type { LayerEffect, LayerEffectKind } from "../../../model/layer-paint-types";
import { svgNode, type SvgNode } from "../../svg-node/svg-node";
import { visibleEffects } from "../../paint-list/read-paints";
import { dropShadowFilter, innerShadowFilter, shadowSigma, type FilterRegion } from "./effect-filters";
import type { FillPassesResult, PaintBox, PaintPass, RichRender } from "../rich-types";

const SIGMA_EXTENT = 3;

interface ComposeRichInput extends PaintBox {
  idBase: string;
  fills: FillPassesResult;
  strokeDefs: SvgNode[];
  strokeNodes: SvgNode[];
  contentPad: number;
  effects: LayerEffect[] | undefined;
}

const ofKind = (effects: LayerEffect[], kind: LayerEffectKind): LayerEffect[] => effects.filter((effect) => effect.kind === kind);

const GLOW_PASSES = 2;

const glowAsShadow = (effect: LayerEffect): LayerEffect => ({ ...effect, kind: "drop-shadow", x: 0, y: 0 });

const expandGlows = (effects: LayerEffect[]): LayerEffect[] =>
  effects.flatMap((effect) => (effect.kind === "glow" ? Array.from({ length: GLOW_PASSES }, () => glowAsShadow(effect)) : [effect]));

const largestBlur = (effects: LayerEffect[]): number => Math.max(0, ...effects.map((effect) => effect.blur));

const shadowExtent = (effect: LayerEffect): number =>
  Math.max(Math.abs(effect.x), Math.abs(effect.y)) + Math.max(0, effect.spread) + shadowSigma(effect.blur) * SIGMA_EXTENT;

const effectMargin = (contentPad: number, drops: LayerEffect[], layerBlur: number): number =>
  Math.ceil(contentPad + Math.max(0, ...drops.map(shadowExtent)) + layerBlur * SIGMA_EXTENT);

export const effectsExtent = (effects: LayerEffect[] | undefined): number => {
  const list = expandGlows(visibleEffects(effects));
  return effectMargin(0, ofKind(list, "drop-shadow"), largestBlur(ofKind(list, "layer-blur")));
};

export const marginRegion = (box: PaintBox, margin: number): FilterRegion => ({
  x: -margin,
  y: -margin,
  width: box.width + margin * 2,
  height: box.height + margin * 2,
});

const COVERAGE_COLOR = "#000000";

const isPainted = (value: unknown): boolean => value !== undefined && value !== "none";

const coverageNode = (node: SvgNode): SvgNode => ({
  ...node,
  attrs: {
    ...node.attrs,
    fill: isPainted(node.attrs.fill) ? COVERAGE_COLOR : node.attrs.fill,
    stroke: isPainted(node.attrs.stroke) ? COVERAGE_COLOR : node.attrs.stroke,
    fillOpacity: undefined,
    strokeOpacity: undefined,
    opacity: undefined,
  },
});

const filteredPass = (filterId: string, nodes: SvgNode[]): PaintPass => ({
  kind: "svg",
  nodes: [svgNode("g", { filter: `url(#${filterId})` }, nodes)],
});

export const composeRich = (input: ComposeRichInput): RichRender => {
  const effects = expandGlows(visibleEffects(input.effects));
  const drops = ofKind(effects, "drop-shadow");
  const inners = ofKind(effects, "inner-shadow");
  const layerBlur = largestBlur(ofKind(effects, "layer-blur"));
  const margin = effectMargin(input.contentPad, drops, layerBlur);
  const region = marginRegion(input, margin);
  const silhouette = [...input.fills.silhouette, ...input.strokeNodes];
  const defs = [...input.fills.defs, ...input.strokeDefs];
  const passes: PaintPass[] = [];
  if (drops.length > 0 && silhouette.length > 0) {
    defs.push(dropShadowFilter(`${input.idBase}-ds`, drops, region));
    passes.push(filteredPass(`${input.idBase}-ds`, silhouette));
  }
  passes.push(...input.fills.passes);
  if (inners.length > 0 && input.fills.silhouette.length > 0) {
    defs.push(innerShadowFilter(`${input.idBase}-is`, inners, region));
    passes.push(filteredPass(`${input.idBase}-is`, input.fills.silhouette));
  }
  if (input.strokeNodes.length > 0) passes.push({ kind: "svg", nodes: input.strokeNodes });
  return {
    width: input.width,
    height: input.height,
    idBase: input.idBase,
    defs,
    passes,
    silhouette,
    coverage: silhouette.map(coverageNode),
    margin,
    layerBlur,
    backgroundBlur: largestBlur(ofKind(effects, "background-blur")),
  };
};
