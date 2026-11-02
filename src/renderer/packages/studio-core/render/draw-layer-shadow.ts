import type { ImageLayer, LayerShadow, UploadLayer } from "../model/studio-types";
import { applyFlip, applyRotation, drawFitted } from "./image-helpers";
import { clipToCorners } from "../shape-render/corners/corner-clip";
import { hasCustomCorners } from "../shape-render/corners/corner-style";
import { hasImageFx, imageLayerFx, type ImageLayerFx } from "../shape-render/image-fx/image-layer-fx";
import { withInnerShadows } from "./image-fx/inner-shadow-canvas";
import { drawImageBackdropBlur } from "./image-fx/backdrop-blur-canvas";

type ShadowableLayer = ImageLayer | UploadLayer;

const buildScaledShadowFilter = (shadow: LayerShadow, s: number): string => {
  const offsetX = (shadow.mode === "glow" ? 0 : shadow.x) * s;
  const offsetY = (shadow.mode === "glow" ? 0 : shadow.y) * s;
  const drop = `drop-shadow(${offsetX}px ${offsetY}px ${shadow.blur * s}px ${shadow.color})`;
  return shadow.mode === "glow" ? `${drop} ${drop}` : drop;
};

const layerFilter = (layer: ShadowableLayer, fx: ImageLayerFx, s: number): string | undefined => {
  const parts = [
    fx.blur > 0 ? `blur(${fx.blur * s}px)` : undefined,
    layer.shadow?.enabled ? buildScaledShadowFilter(layer.shadow, s) : undefined,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" ") : undefined;
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

  if ((layer.borderRadius ?? 0) > 0 || hasCustomCorners(layer)) {
    clipToCorners(ctx, layer, { x: 0, y: 0, width, height }, s);
  }
  if (filterStr) ctx.filter = filterStr;
  ctx.imageSmoothingEnabled = false;
  drawFitted(ctx, source, layer.fit, { x: 0, y: 0, width, height }, layer.crop);
  return canvas;
};

export const drawComposedWithShadow = (
  ctx: CanvasRenderingContext2D,
  composed: HTMLCanvasElement,
  layer: ShadowableLayer,
  s: number,
): void => {
  const fx = imageLayerFx(layer.layerEffects);
  const painted = withInnerShadows(composed, fx.inner, s);
  if (fx.backdrop > 0) drawImageBackdropBlur(ctx, painted, layer, fx.backdrop, s);
  const filter = layerFilter(layer, fx, s);
  ctx.save();
  applyRotation(ctx, layer, s);
  applyFlip(ctx, layer, s);
  ctx.globalAlpha = layer.opacity;
  if (filter) ctx.filter = filter;
  ctx.drawImage(painted, layer.x * s, layer.y * s, layer.width * s, layer.height * s);
  ctx.restore();
};

export const drawLayerWithShadow = (
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  layer: ShadowableLayer,
  filterStr: string | undefined,
  s: number,
): boolean => {
  if (!layer.shadow?.enabled && !hasImageFx(imageLayerFx(layer.layerEffects))) return false;

  const composed = composeLayerCanvas(source, layer, filterStr, s);
  if (!composed) return false;

  drawComposedWithShadow(ctx, composed, layer, s);
  return true;
};
