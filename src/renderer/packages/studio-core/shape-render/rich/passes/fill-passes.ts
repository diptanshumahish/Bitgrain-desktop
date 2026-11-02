import type { LayerFill } from "../../../model/layer-paint-types";
import type { SvgNode } from "../../svg-node/svg-node";
import { withAttrs } from "../../stroke/stroke-align";
import { gradientPaint } from "../../paint/gradient-paint";
import { grainFilter } from "./grain-filter";
import { parseColor, rgbHex } from "../../paint/color-parse";
import type { FillPassesResult, PaintBox, PaintPass } from "../rich-types";

const SILHOUETTE_COLOR = "#000000";

interface SingleFill {
  defs: SvgNode[];
  pass: PaintPass;
  silhouette: SvgNode;
}

export const partialOpacity = (opacity: number): number | undefined => (opacity < 1 ? opacity : undefined);

interface SplitColor {
  color: string;
  opacity: number;
}

export const splitColor = (color: string, opacity: number): SplitColor => {
  const rgba = parseColor(color);
  if (rgba.a >= 1) return { color, opacity };
  return { color: rgbHex(rgba), opacity: rgba.a * opacity };
};

const normalBlend = (fill: LayerFill): LayerFill["blendMode"] =>
  fill.blendMode && fill.blendMode !== "normal" ? fill.blendMode : undefined;

const solidSilhouette = (geometry: SvgNode, opacity: number): SvgNode =>
  withAttrs(geometry, { fill: SILHOUETTE_COLOR, fillOpacity: partialOpacity(opacity), stroke: "none" });

const paintedFill = (geometry: SvgNode, fill: LayerFill, paint: SplitColor, defs: SvgNode[]): SingleFill => {
  const node = withAttrs(geometry, { fill: paint.color, fillOpacity: partialOpacity(paint.opacity), stroke: "none" });
  return { defs, pass: { kind: "svg", nodes: [node], blendMode: normalBlend(fill) }, silhouette: node };
};

const singleFill = (geometry: SvgNode, fill: LayerFill, id: string, box: PaintBox): SingleFill | null => {
  if (fill.kind === "gradient" && fill.gradient) {
    const paint = gradientPaint(fill.gradient, id, box, box);
    return paintedFill(geometry, fill, { color: paint.fill, opacity: fill.opacity }, paint.defs);
  }
  if (fill.kind === "image" && fill.image) {
    const pass: PaintPass = { kind: "image", geometry, image: fill.image, opacity: fill.opacity, blendMode: normalBlend(fill), patternId: id };
    return { defs: [], pass, silhouette: solidSilhouette(geometry, fill.opacity) };
  }
  if (fill.kind === "grain") {
    const node = withAttrs(geometry, { fill: SILHOUETTE_COLOR, stroke: "none", filter: `url(#${id})`, opacity: partialOpacity(fill.opacity) });
    const pass: PaintPass = { kind: "svg", nodes: [node], blendMode: normalBlend(fill) };
    return { defs: [grainFilter(id, box, fill.grain)], pass, silhouette: solidSilhouette(geometry, fill.opacity) };
  }
  if (fill.kind === "solid") return paintedFill(geometry, fill, splitColor(fill.color, fill.opacity), []);
  return null;
};

export const fillPasses = (geometry: SvgNode, fills: LayerFill[], idBase: string, box: PaintBox): FillPassesResult => {
  const built = fills
    .map((fill, index) => singleFill(geometry, fill, `${idBase}-f${index}`, box))
    .filter((entry): entry is SingleFill => entry !== null);
  return {
    defs: built.flatMap((entry) => entry.defs),
    passes: built.map((entry) => entry.pass),
    silhouette: built.map((entry) => entry.silhouette),
  };
};
