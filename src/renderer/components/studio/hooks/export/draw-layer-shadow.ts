import type { ImageLayer, LayerShadow, UploadLayer } from "../../../../data/studioTypes";
import { applyFlip, applyRotation, containFit, coverFit } from "./image-helpers";

type ShadowableLayer = ImageLayer | UploadLayer;

const buildScaledShadowFilter = (shadow: LayerShadow, s: number): string => {
  const offsetX = (shadow.mode === "glow" ? 0 : shadow.x) * s;
  const offsetY = (shadow.mode === "glow" ? 0 : shadow.y) * s;
  const drop = `drop-shadow(${offsetX}px ${offsetY}px ${shadow.blur * s}px ${shadow.color})`;
  return shadow.mode === "glow" ? `${drop} ${drop}` : drop;
};

const composeLayerCanvas = (
  source: HTMLImageElement | HTMLCanvasElement,
  layer: ShadowableLayer,
  filterStr: string | undefined,
  s: number,
): HTMLCanvasElement | null => {
  const width = Math.max(1, Math.round(layer.width * s));
  const height = Math.max(1, Math.round(layer.height * s));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const radius = (layer.borderRadius ?? 0) * s;
  if (radius > 0) {
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);
    ctx.clip();
  }
  if (filterStr) ctx.filter = filterStr;
  ctx.imageSmoothingEnabled = false;
  if (layer.fit === "cover") coverFit(ctx, source, 0, 0, width, height);
  else if (layer.fit === "contain") containFit(ctx, source, 0, 0, width, height);
  else ctx.drawImage(source, 0, 0, width, height);
  return canvas;
};

export const drawComposedWithShadow = (
  ctx: CanvasRenderingContext2D,
  composed: HTMLCanvasElement,
  layer: ShadowableLayer,
  s: number,
): void => {
  ctx.save();
  applyRotation(ctx, layer, s);
  applyFlip(ctx, layer, s);
  ctx.globalAlpha = layer.opacity;
  if (layer.shadow?.enabled) ctx.filter = buildScaledShadowFilter(layer.shadow, s);
  ctx.drawImage(composed, layer.x * s, layer.y * s, layer.width * s, layer.height * s);
  ctx.restore();
};

export const drawLayerWithShadow = (
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  layer: ShadowableLayer,
  filterStr: string | undefined,
  s: number,
): boolean => {
  if (!layer.shadow?.enabled) return false;

  const composed = composeLayerCanvas(source, layer, filterStr, s);
  if (!composed) return false;

  drawComposedWithShadow(ctx, composed, layer, s);
  return true;
};
