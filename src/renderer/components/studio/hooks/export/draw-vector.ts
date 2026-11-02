import type { VectorLayer, VectorFillFit, BezierAnchor } from "../../../../data/studioTypes";
import { vectorPathToD, dashArrayFor } from "../../../../utils/vector-utils";
import { scaleVectorPath } from "../../../../utils/scale-vector-path";
import { loadImage } from "./image-helpers";

const VIEWBOX_SIZE = 100;

interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

const fitToAspectRatio = (fit: VectorFillFit): string => {
  if (fit === "stretch") return "none";
  if (fit === "cover") return "xMidYMid slice";
  return "xMidYMid meet";
};

const computeViewBox = (layer: VectorLayer): ViewBox => {
  let minX = 0;
  let minY = 0;
  let maxX = VIEWBOX_SIZE;
  let maxY = VIEWBOX_SIZE;
  const extend = (point?: { x: number; y: number }): void => {
    if (!point) return;
    if (point.x < minX) minX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.x > maxX) maxX = point.x;
    if (point.y > maxY) maxY = point.y;
  };
  for (const anchor of [layer.path.anchors, ...(layer.path.extraRings ?? [])].flat() as BezierAnchor[]) {
    extend(anchor);
    extend(anchor.inHandle);
    extend(anchor.outHandle);
  }
  const scaleX = layer.width / VIEWBOX_SIZE;
  const scaleY = layer.height / VIEWBOX_SIZE;
  const pad = layer.strokeWidth / 2;
  return {
    minX: minX * scaleX - pad,
    minY: minY * scaleY - pad,
    width: (maxX - minX) * scaleX + pad * 2,
    height: (maxY - minY) * scaleY + pad * 2,
  };
};

const buildVectorSvg = (layer: VectorLayer, viewBox: ViewBox): string => {
  const patternId = `vfill-${layer.id}`;
  const pathFill = !layer.path.closed ? "none" : layer.fillImage ? `url(#${patternId})` : layer.fill;
  const defs = layer.fillImage
    ? `<defs><pattern id="${patternId}" x="0" y="0" width="${layer.width}" height="${layer.height}" patternUnits="userSpaceOnUse"><image href="${layer.fillImage.src}" x="0" y="0" width="${layer.width}" height="${layer.height}" preserveAspectRatio="${fitToAspectRatio(layer.fillImage.fit)}"/></pattern></defs>`
    : "";
  const dashArray = dashArrayFor(layer.dashStyle, layer.strokeWidth);
  const dashAttr = dashArray ? ` stroke-dasharray="${dashArray}"` : "";
  const pixelPath = scaleVectorPath(layer.path, layer.width / VIEWBOX_SIZE, layer.height / VIEWBOX_SIZE);
  const path = `<path d="${vectorPathToD(pixelPath)}" fill="${pathFill}" stroke="${layer.strokeColor}" stroke-width="${layer.strokeWidth}" stroke-linecap="${layer.lineCap}" stroke-linejoin="${layer.lineJoin}"${dashAttr}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}" width="${viewBox.width}" height="${viewBox.height}">${defs}${path}</svg>`;
};

export const drawVectorLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: VectorLayer,
  s: number,
): Promise<void> => {
  const viewBox = computeViewBox(layer);
  const svgStr = buildVectorSvg(layer, viewBox);
  const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
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
    ctx.drawImage(img, (layer.x + viewBox.minX) * s, (layer.y + viewBox.minY) * s, viewBox.width * s, viewBox.height * s);
    ctx.restore();
  } catch {
    /* skip */
  }
};
