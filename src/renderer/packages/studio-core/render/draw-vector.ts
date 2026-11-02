import type { VectorLayer, VectorFillFit, BezierAnchor } from "../model/studio-types";
import { vectorPathToD } from "../geometry/vector-utils";
import { vectorDashArray, vectorPaint } from "../shape-render/vector-paint";
import { svgNodesToString } from "../shape-render/svg-node/svg-node";
import { svgSafeId } from "../shape-render/svg-id";
import { scaleVectorPath } from "../geometry/scale-vector-path";
import { loadImage } from "./image-helpers";
import { hasRichPaint } from "../shape-render/rich/has-rich-paint";
import { buildVectorRich } from "../shape-render/rich/vector-rich";
import { drawRichLayer } from "./rich-paint/draw-rich-layer";

const VIEWBOX_SIZE = 100;
const OUTSIDE_PAD_RATIO = 4;

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
  const pad = layer.strokeAlign === "outside" ? layer.strokeWidth * OUTSIDE_PAD_RATIO : layer.strokeWidth / 2;
  return {
    minX: minX * scaleX - pad,
    minY: minY * scaleY - pad,
    width: (maxX - minX) * scaleX + pad * 2,
    height: (maxY - minY) * scaleY + pad * 2,
  };
};

const strokeAttrs = (layer: VectorLayer, width: number, extra: string): string => {
  const dashArray = vectorDashArray(layer, layer.strokeWidth, 1);
  const dashAttr = dashArray ? ` stroke-dasharray="${dashArray}"` : "";
  return `stroke="${layer.strokeColor}" stroke-width="${width}" stroke-linecap="${layer.lineCap}" stroke-linejoin="${layer.lineJoin}"${dashAttr}${extra}`;
};

const alignmentAttrs = (attrs: Record<string, unknown>): string =>
  [attrs.clipPath ? ` clip-path="${String(attrs.clipPath)}"` : "", attrs.mask ? ` mask="${String(attrs.mask)}"` : ""].join("");

const buildVectorSvg = (layer: VectorLayer, viewBox: ViewBox): string => {
  const patternId = `vfill-${layer.id}`;
  const pixelPath = scaleVectorPath(layer.path, layer.width / VIEWBOX_SIZE, layer.height / VIEWBOX_SIZE);
  const d = vectorPathToD(pixelPath);
  const box = { width: layer.width, height: layer.height };
  const paint = vectorPaint({ layer, d, idBase: `vec-${svgSafeId(layer.id)}`, userBox: box, pixelBox: box });
  const pathFill = !layer.path.closed ? "none" : layer.fillImage ? `url(#${patternId})` : paint.gradientFill ?? layer.fill;
  const imageDefs = layer.fillImage
    ? `<pattern id="${patternId}" x="0" y="0" width="${layer.width}" height="${layer.height}" patternUnits="userSpaceOnUse"><image href="${layer.fillImage.src}" x="0" y="0" width="${layer.width}" height="${layer.height}" preserveAspectRatio="${fitToAspectRatio(layer.fillImage.fit)}"/></pattern>`
    : "";
  const allDefs = `${imageDefs}${svgNodesToString(paint.defs)}`;
  const defs = allDefs ? `<defs>${allDefs}</defs>` : "";
  const strokeWidth = layer.strokeWidth * paint.alignment.widthFactor;
  const paths = paint.alignment.split
    ? `<path d="${d}" fill="${pathFill}" stroke="none"/><path d="${d}" fill="none" ${strokeAttrs(layer, strokeWidth, alignmentAttrs(paint.alignment.attrs))}/>`
    : `<path d="${d}" fill="${pathFill}" ${strokeAttrs(layer, strokeWidth, "")}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}" width="${viewBox.width}" height="${viewBox.height}">${defs}${paths}</svg>`;
};

export const drawVectorLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: VectorLayer,
  s: number,
): Promise<void> => {
  if (hasRichPaint(layer)) {
    await drawRichLayer(ctx, layer, buildVectorRich(layer, `vec-${svgSafeId(layer.id)}`), s);
    return;
  }
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
