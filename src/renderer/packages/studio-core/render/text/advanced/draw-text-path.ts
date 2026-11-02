import type { TextLayer } from "../../../model/studio-types";
import { createPathSampler, pointAtDistance, type PathSampler } from "../../../text/path/path-sampler";
import { textPathPixels, textPathString } from "../../../text/path/text-path-geometry";
import { effectiveFontWeight, obliqueStyle } from "../../../text/layout/text-feature-css";
import { setCanvasLetterSpacing } from "../../../text/rich-text/letter-spacing";
import { applyFlip, applyRotation } from "../../image-helpers";
import { applyCanvasFeatures, canvasFeaturesFor, canvasSupportsOblique } from "./canvas-features";

const PERCENT = 100;
const HALF = 2;

const ANCHOR_SHIFT: Record<TextLayer["align"], number> = {
  left: 0,
  justify: 0,
  center: 0.5,
  right: 1,
};

const pathFont = (ctx: CanvasRenderingContext2D, layer: TextLayer, s: number): string => {
  const oblique = obliqueStyle(layer.fontVariations?.slnt);
  const italic = layer.fontStyle === "italic" ? "italic" : "";
  const style = italic || (oblique && canvasSupportsOblique(ctx) ? oblique : "");
  return [style, effectiveFontWeight(layer), `${layer.fontSize * s}px`, layer.fontFamily].filter(Boolean).join(" ");
};

const prefixWidths = (ctx: CanvasRenderingContext2D, chars: string[]): number[] =>
  chars.map((_, index) => ctx.measureText(chars.slice(0, index + 1).join("")).width);

const drawGlyphs = (ctx: CanvasRenderingContext2D, layer: TextLayer, s: number, sampler: PathSampler, chars: string[]): void => {
  const ends = prefixWidths(ctx, chars);
  const total = ends[ends.length - 1] ?? 0;
  const start = (layer.textPath?.offset ?? 0) / PERCENT * sampler.total - total * ANCHOR_SHIFT[layer.align];
  chars.forEach((char, index) => {
    const begin = index === 0 ? 0 : ends[index - 1];
    const width = ends[index] - begin;
    const middle = start + begin + width / HALF;
    if (middle < 0 || middle > sampler.total) return;
    const point = pointAtDistance(sampler, middle);
    ctx.save();
    ctx.translate(layer.x * s + point.x, layer.y * s + point.y);
    ctx.rotate(point.angle);
    ctx.fillText(char, -width / HALF, 0);
    ctx.restore();
  });
};

export const drawTextOnPath = (ctx: CanvasRenderingContext2D, layer: TextLayer, s: number): void => {
  if (!layer.textPath) return;
  const sampler = createPathSampler(textPathPixels(layer.textPath.path, layer.width * s, layer.height * s));
  if (sampler.total <= 0) return;
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  applyRotation(ctx, layer, s);
  applyFlip(ctx, layer, s);
  ctx.font = pathFont(ctx, layer, s);
  setCanvasLetterSpacing(ctx, layer.letterSpacing * s);
  applyCanvasFeatures(ctx, canvasFeaturesFor(layer), layer.letterSpacing * s);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = layer.color;
  drawGlyphs(ctx, layer, s, sampler, Array.from(textPathString(layer)));
  ctx.restore();
};
