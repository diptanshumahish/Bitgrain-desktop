import type { TornEdgeEffect, UploadLayer } from "../../../../data/studioTypes";
import { buildTornEdge, hashStringSeed, type TornPoint } from "../../../../utils/torn-edge";
import { containFit, coverFit } from "./image-helpers";

const DEFAULT_BORDER_COLOR = "#ffffff";

const traceLocalPath = (
  ctx: CanvasRenderingContext2D,
  points: TornPoint[],
  s: number,
): void => {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x * s, point.y * s);
    else ctx.lineTo(point.x * s, point.y * s);
  });
  ctx.closePath();
};

const drawFittedSource = (
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  fit: UploadLayer["fit"],
  width: number,
  height: number,
): void => {
  if (fit === "cover") coverFit(ctx, source, 0, 0, width, height);
  else if (fit === "contain") containFit(ctx, source, 0, 0, width, height);
  else ctx.drawImage(source, 0, 0, width, height);
};

export const composeTornUploadCanvas = (
  source: HTMLImageElement | HTMLCanvasElement,
  layer: UploadLayer,
  tornEdge: TornEdgeEffect,
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

  const geometry = buildTornEdge(layer.width, layer.height, tornEdge, hashStringSeed(layer.id));
  if (tornEdge.border > 0) {
    traceLocalPath(ctx, geometry.outer, s);
    ctx.fillStyle = tornEdge.borderColor ?? DEFAULT_BORDER_COLOR;
    ctx.fill();
  }
  traceLocalPath(ctx, geometry.inner, s);
  ctx.clip();
  if (filterStr) ctx.filter = filterStr;
  ctx.imageSmoothingEnabled = !layer.bitgrainEffect;
  drawFittedSource(ctx, source, layer.fit, width, height);
  return canvas;
};
