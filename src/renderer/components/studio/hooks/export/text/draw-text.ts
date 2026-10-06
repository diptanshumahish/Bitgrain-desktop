import type { TextLayer } from "../../../../../data/studioTypes";
import { buildTextShadowSpecs } from "../../../text-effects/text-shadow-specs";
import { applyFlip, applyRotation } from "../image-helpers";
import { buildGradientFill, loadLayerFonts } from "./text-helpers";
import { layoutPlainText, layoutRichText, runFont, type PositionedRun } from "./text-layout";
import {
  drawFillPass,
  drawShadowPasses,
  measureOffscreenBounds,
  prepareTextContext,
} from "./text-offscreen";

const SHADOW_SHIFT_MULTIPLIER = 2;

const usesRichLayout = (layer: TextLayer): boolean => {
  if (!layer.richContent) return false;
  const svgPathOnCanvas = (layer.effects ?? []).length === 0 && Boolean(layer.gradientText?.enabled);
  return !svgPathOnCanvas;
};

const layoutRuns = (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
  baseStyle: string,
): PositionedRun[] => {
  prepareTextContext(ctx, layer, s);
  if (usesRichLayout(layer)) return layoutRichText(ctx, layer, s, baseStyle);
  const baseFont = runFont({ ...layer, fontStyle: baseStyle || "normal" }, s);
  return layoutPlainText(ctx, layer, s, baseFont);
};

const renderTextOffscreen = (
  layer: TextLayer,
  s: number,
  baseStyle: string,
): { canvas: HTMLCanvasElement; originX: number; originY: number } | null => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const runs = layoutRuns(ctx, layer, s, baseStyle);
  const specs = buildTextShadowSpecs(layer.effects ?? [], s);
  const bounds = measureOffscreenBounds(layer, s, runs, specs);
  canvas.width = bounds.width;
  canvas.height = bounds.height;
  prepareTextContext(ctx, layer, s);
  ctx.translate(-bounds.originX, -bounds.originY);
  drawShadowPasses(ctx, runs, specs, bounds.width * SHADOW_SHIFT_MULTIPLIER);
  drawFillPass(ctx, runs, buildGradientFill(ctx, layer, s));
  return { canvas, originX: bounds.originX, originY: bounds.originY };
};

export const drawText = async (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
): Promise<void> => {
  const baseStyle = layer.fontStyle && layer.fontStyle !== "regular" ? layer.fontStyle : "";
  await loadLayerFonts(layer, s, baseStyle);
  const rendered = renderTextOffscreen(layer, s, baseStyle);
  if (!rendered) return;

  ctx.save();
  ctx.globalAlpha = layer.opacity;
  applyRotation(ctx, layer, s);
  applyFlip(ctx, layer, s);
  if (!layer.autoResize) {
    ctx.beginPath();
    ctx.rect(layer.x * s, layer.y * s, layer.width * s, layer.height * s);
    ctx.clip();
  }
  ctx.drawImage(rendered.canvas, rendered.originX, rendered.originY);
  ctx.restore();
};
