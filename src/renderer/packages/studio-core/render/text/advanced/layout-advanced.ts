import type { TextLayer } from "../../../model/studio-types";
import { buildListMarkers, paragraphListStyles } from "../../../text/layout/paragraphs/list-markers";
import { resolveTextSizing } from "../../../text/layout/text-sizing";
import { verticalOffset } from "../../../text/layout/text-vertical-align";
import { effectiveFontWeight, obliqueStyle } from "../../../text/layout/text-feature-css";
import { parseDecoration } from "../../../text/rich-text/text-decoration";
import { setCanvasLetterSpacing } from "../../../text/rich-text/letter-spacing";
import type { RenderRun } from "../text-helpers";
import { runFont, type PositionedRun } from "../text-layout";
import { applyCanvasFeatures, canvasFeaturesFor, canvasSupportsOblique } from "./canvas-features";
import { layerParagraphs, type BaseRun } from "./paragraph-runs";
import { buildLines, type LaidLine } from "./line-builder";
import { positionLine, type RunStyler } from "./position-line";

const baseStyleFor = (layer: TextLayer, ctx: CanvasRenderingContext2D, baseStyle: string): string => {
  const oblique = obliqueStyle(layer.fontVariations?.slnt);
  if (oblique && !baseStyle && canvasSupportsOblique(ctx)) return oblique;
  return baseStyle || "normal";
};

const baseRunFor = (layer: TextLayer, fontStyle: string): BaseRun => ({
  color: layer.color,
  fontWeight: effectiveFontWeight(layer),
  fontFamily: layer.fontFamily,
  fontSize: layer.fontSize,
  fontStyle,
  ...parseDecoration(layer.textDecoration),
  textTransform: layer.textTransform,
  letterSpacing: layer.letterSpacing,
});

const createStyler = (ctx: CanvasRenderingContext2D, layer: TextLayer, s: number): RunStyler => {
  const features = canvasFeaturesFor(layer);
  const useGradient = Boolean(layer.gradientText?.enabled);
  const letterSpacing = (run: RenderRun): number => (run.letterSpacing ?? layer.letterSpacing) * s;
  const font = (run: RenderRun): string => runFont(run, s);
  const width = (run: RenderRun): number => {
    ctx.font = font(run);
    setCanvasLetterSpacing(ctx, letterSpacing(run));
    applyCanvasFeatures(ctx, features, letterSpacing(run));
    return ctx.measureText(run.text).width;
  };
  return { font, width, letterSpacing, color: (run) => (useGradient ? null : run.color), features, scale: s };
};

const lineTops = (layer: TextLayer, s: number, lines: LaidLine[]): number[] => {
  const lineHeight = layer.fontSize * s * layer.lineHeight;
  const gap = (layer.paragraphSpacing ?? 0) * s;
  const tops = lines.map((line, index) => layer.y * s + index * lineHeight + line.paragraph * gap);
  if (resolveTextSizing(layer) === "auto-width" || tops.length === 0) return tops;
  const contentHeight = tops[tops.length - 1] - tops[0] + layer.fontSize * s;
  const offset = verticalOffset(layer.verticalAlign, layer.height * s, contentHeight);
  return tops.map((top) => top + offset);
};

const markerRun = (line: LaidLine, base: RenderRun, y: number, layer: TextLayer, s: number, styler: RunStyler): PositionedRun[] => {
  const marker: RenderRun = { ...base, text: line.marker, underline: false, strike: false };
  return positionLine([marker], { left: layer.x * s, available: 0, y, align: "left", justify: false }, styler);
};

export const layoutAdvancedText = (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
  baseStyle: string,
): PositionedRun[] => {
  const base: RenderRun = { ...baseRunFor(layer, baseStyleFor(layer, ctx, baseStyle)), text: "" };
  const styler = createStyler(ctx, layer, s);
  const paragraphs = layerParagraphs(layer, base);
  const styles = paragraphListStyles(layer.listStyles, paragraphs.length);
  const markers = buildListMarkers(styles);
  const inputs = paragraphs.map((runs, index) => ({ runs, style: styles[index], marker: markers[index] }));
  const lines = buildLines(layer, s, styler.width, inputs, base);
  const tops = lineTops(layer, s, lines);
  return lines.flatMap((line, index) => {
    const frame = { left: line.left, available: line.available, y: tops[index], align: layer.align, justify: layer.align === "justify" && !line.last };
    const runs = positionLine(line.runs, frame, styler);
    return line.marker ? [...markerRun(line, base, tops[index], layer, s, styler), ...runs] : runs;
  });
};
