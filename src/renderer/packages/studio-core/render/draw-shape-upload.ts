import type { ShapeLayer, TapeStrips, UploadLayer } from "../model/studio-types";
import { buildShapeSvg } from "./shape-svg";
import { applyFlip, applyRotation, drawFitted, loadImage } from "./image-helpers";
import { drawComposedWithShadow, drawLayerWithShadow } from "./draw-layer-shadow";
import { composeTornUploadCanvas } from "./draw-torn-upload";
import { constructFilterString } from "../image/filter-utils";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { buildTapePieces } from "../geometry/tape";
import { visibleTornEdge } from "../geometry/torn-edge";
import { applyLayerEffectForExport } from "./effects/layer-effect-export";
import { clipToCorners } from "../shape-render/corners/corner-clip";
import { hasRichPaint } from "../shape-render/rich/has-rich-paint";
import { buildShapeRich } from "../shape-render/rich/shape-rich";
import { svgSafeId } from "../shape-render/svg-id";
import { drawRichLayer } from "./rich-paint/draw-rich-layer";


const drawTape = (
  ctx: CanvasRenderingContext2D,
  layer: UploadLayer,
  tape: TapeStrips,
  s: number,
): void => {
  const pieces = buildTapePieces(layer.width, layer.height, tape);
  if (pieces.length === 0) return;
  ctx.save();
  ctx.globalAlpha = layer.opacity * tape.opacity;
  applyRotation(ctx, layer, s);
  applyFlip(ctx, layer, s);
  ctx.fillStyle = tape.color;
  pieces.forEach((piece) => {
    ctx.save();
    ctx.translate((layer.x + piece.cx) * s, (layer.y + piece.cy) * s);
    ctx.rotate((piece.angle * Math.PI) / 180);
    ctx.fillRect(
      (-piece.length / 2) * s,
      (-piece.thickness / 2) * s,
      piece.length * s,
      piece.thickness * s,
    );
    ctx.restore();
  });
  ctx.restore();
};

const drawPlainUpload = (
  ctx: CanvasRenderingContext2D,
  drawSource: HTMLImageElement | HTMLCanvasElement,
  layer: UploadLayer,
  filterStr: string | undefined,
  s: number,
): void => {
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  applyRotation(ctx, layer, s);
  applyFlip(ctx, layer, s);
  if (filterStr) ctx.filter = filterStr;
  clipToCorners(ctx, layer, { x: layer.x * s, y: layer.y * s, width: layer.width * s, height: layer.height * s }, s);
  ctx.imageSmoothingEnabled = !layer.bitgrainEffect;
  drawFitted(ctx, drawSource, layer.fit, { x: layer.x * s, y: layer.y * s, width: layer.width * s, height: layer.height * s }, layer.crop);
  ctx.restore();
};

export const drawShapeLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: ShapeLayer,
  s: number,
): Promise<void> => {
  if (hasRichPaint(layer)) {
    await drawRichLayer(ctx, layer, buildShapeRich(layer, `shp-${svgSafeId(layer.id)}`), s);
    return;
  }
  const { svg, pad } = buildShapeSvg(layer);
  const dataUrl =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  try {
    const img = await loadImage(dataUrl);
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    if (layer.rotation || layer.flipH || layer.flipV) {
      const cx = (layer.x + layer.width / 2) * s;
      const cy = (layer.y + layer.height / 2) * s;
      ctx.translate(cx, cy);
      if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.flipH ? -1 : 1, layer.flipV ? -1 : 1);
      ctx.translate(-cx, -cy);
    }
    ctx.drawImage(
      img,
      (layer.x - pad) * s, (layer.y - pad) * s,
      (layer.width + pad * 2) * s, (layer.height + pad * 2) * s,
    );
    ctx.restore();
  } catch {
    /* skip */
  }
};

export const drawUploadLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: UploadLayer,
  s: number,
  textureScale: number,
): Promise<void> => {
  const uploadSrc = resolveAssetUrl(layer.src);
  if (!uploadSrc) return;
  try {
    const img = await loadImage(uploadSrc);
    const drawSource = await applyLayerEffectForExport(img, layer, s, textureScale);
    const filterStr = constructFilterString(layer.filters);

    const tornEdge = visibleTornEdge(layer.tornEdge);
    if (tornEdge) {
      const composed = composeTornUploadCanvas(drawSource, layer, tornEdge, filterStr, s);
      if (composed) drawComposedWithShadow(ctx, composed, layer, s);
    } else if (!drawLayerWithShadow(ctx, drawSource, layer, filterStr, s)) {
      drawPlainUpload(ctx, drawSource, layer, filterStr, s);
    }

    if (layer.tape) drawTape(ctx, layer, layer.tape, s);
  } catch {
    /* skip */
  }
};
