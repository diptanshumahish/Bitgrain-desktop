import type { ShapeLayer, TapeStrips, UploadLayer } from "../../../../data/studioTypes";
import { buildShapeSvg } from "./shape-svg";
import { applyFlip, applyRotation, drawFitted, loadImage } from "./image-helpers";
import { drawComposedWithShadow, drawLayerWithShadow } from "./draw-layer-shadow";
import { composeTornUploadCanvas } from "./draw-torn-upload";
import { constructFilterString } from "../../../../utils/filter-utils";
import { resolveAssetUrl } from "../../../../lib/api-client";
import { buildTapePieces } from "../../../../utils/tape";
import { applyLayerEffectForExport } from "./effects/layer-effect-export";


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
  ctx.beginPath();
  if (layer.borderRadius > 0)
    ctx.roundRect(layer.x * s, layer.y * s, layer.width * s, layer.height * s, layer.borderRadius * s);
  else ctx.rect(layer.x * s, layer.y * s, layer.width * s, layer.height * s);
  ctx.clip();
  ctx.imageSmoothingEnabled = !layer.bitgrainEffect;
  drawFitted(ctx, drawSource, layer.fit, { x: layer.x * s, y: layer.y * s, width: layer.width * s, height: layer.height * s }, layer.crop);
  ctx.restore();
};

export const drawShapeLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: ShapeLayer,
  s: number,
): Promise<void> => {
  const svgStr = buildShapeSvg(layer);
  const dataUrl =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
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
      layer.x * s, layer.y * s,
      layer.width * s, layer.height * s,
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
): Promise<void> => {
  const uploadSrc = resolveAssetUrl(layer.src);
  if (!uploadSrc) return;
  try {
    const img = await loadImage(uploadSrc);
    const drawSource = await applyLayerEffectForExport(img, layer, s);
    const filterStr = constructFilterString(layer.filters);

    if (layer.tornEdge) {
      const composed = composeTornUploadCanvas(drawSource, layer, layer.tornEdge, filterStr, s);
      if (composed) drawComposedWithShadow(ctx, composed, layer, s);
    } else if (!drawLayerWithShadow(ctx, drawSource, layer, filterStr, s)) {
      drawPlainUpload(ctx, drawSource, layer, filterStr, s);
    }

    if (layer.tape) drawTape(ctx, layer, layer.tape, s);
  } catch {
    /* skip */
  }
};
