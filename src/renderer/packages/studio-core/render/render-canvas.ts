import type {
  TemplateDef,
  Layer,
  ImageLayer,
  TextLayer,
  ShapeLayer,
  UploadLayer,
  VectorLayer,
  InkLayer,
  AdjustmentLayer,
} from "../model/studio-types";
import { applyFlip, applyRotation, drawFitted, loadImage } from "./image-helpers";
import { drawText } from "./text/draw-text";
import { laidOutChildren, syncHugSizes } from "../layout/auto-layout";
import { drawShapeLayer, drawUploadLayer } from "./draw-shape-upload";
import { drawVectorLayer } from "./draw-vector";
import { clipToCorners } from "../shape-render/corners/corner-clip";
import { drawInkLayer } from "./draw-ink";
import { drawLayerWithShadow } from "./draw-layer-shadow";
import { constructFilterString } from "../image/filter-utils";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { applyLayerEffectForExport } from "./effects/layer-effect-export";
import { processAdjustmentRegion } from "./effects/adjustment-region";
import { frameShapeEffects } from "../shape-render/rich/frame-effect-shape";
import { groupMaskRuns } from "../mask/mask-runs";
import { buildMaskScope, isMaskScope, mapFlatLayers, type FlatItem } from "./mask/mask-scope";
import { drawMaskScope } from "./mask/draw-mask-scope";
import { layersInsideBounds } from "../geometry/off-page-bounds";
import { registerAdminFonts } from "../fonts/admin-fonts";


const rotateAroundCenter = (
  layer: Layer,
  pivotX: number,
  pivotY: number,
  angleDeg: number,
): Layer => {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + layer.height / 2;
  const dx = centerX - pivotX;
  const dy = centerY - pivotY;
  const rotatedX = pivotX + dx * cos - dy * sin;
  const rotatedY = pivotY + dx * sin + dy * cos;
  const currentRotation = (layer as { rotation?: number }).rotation ?? 0;
  return {
    ...layer,
    x: rotatedX - layer.width / 2,
    y: rotatedY - layer.height / 2,
    rotation: currentRotation + angleDeg,
  } as Layer;
};

const flattenLayers = (
  layers: Layer[],
  offsetX = 0,
  offsetY = 0,
): FlatItem[] => {
  const out: FlatItem[] = [];
  for (const entry of groupMaskRuns(layers)) {
    if (entry.kind === "mask") {
      const scope = buildMaskScope(entry, (list) => flattenLayers(list, offsetX, offsetY));
      if (scope) out.push(scope);
      continue;
    }
    const layer = entry.slot.layer;
    if (!layer.visible) continue;
    if (layer.type === "group") {
      const childOffsetX = offsetX + layer.x;
      const childOffsetY = offsetY + layer.y;
      let children = flattenLayers(laidOutChildren(layer), childOffsetX, childOffsetY);
      const groupRotation = layer.rotation ?? 0;
      if (groupRotation) {
        const pivotX = childOffsetX + layer.width / 2;
        const pivotY = childOffsetY + layer.height / 2;
        children = mapFlatLayers(children, (child) =>
          rotateAroundCenter(child, pivotX, pivotY, groupRotation),
        );
      }
      out.push(...children);
      continue;
    }
    if (layer.type === "frame") {
      const childOffsetX = offsetX + layer.x;
      const childOffsetY = offsetY + layer.y;
      if (layer.background && layer.background !== "transparent") {
        out.push({
          id: `${layer.id}-bg`,
          type: "shape",
          shapeType: "rect",
          name: "Frame background",
          x: childOffsetX,
          y: childOffsetY,
          width: layer.width,
          height: layer.height,
          fill: layer.background,
          stroke: "transparent",
          strokeWidth: 0,
          borderRadius: 0,
          rotation: 0,
          opacity: layer.opacity,
          locked: false,
          visible: true,
          layerEffects: frameShapeEffects(layer),
        });
      }
      let children = flattenLayers(laidOutChildren(layer), childOffsetX, childOffsetY);
      const frameRotation = layer.rotation ?? 0;
      if (frameRotation) {
        const pivotX = childOffsetX + layer.width / 2;
        const pivotY = childOffsetY + layer.height / 2;
        children = mapFlatLayers(children, (child) =>
          rotateAroundCenter(child, pivotX, pivotY, frameRotation),
        );
      }
      out.push(...children);
      continue;
    }
    out.push({ ...layer, x: layer.x + offsetX, y: layer.y + offsetY });
  }
  return out;
};

const drawImageLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  s: number,
  imageSrc: string,
  textureScale: number,
): Promise<void> => {
  try {
    const img = await loadImage(imageSrc);
    const sourceForDraw = await applyLayerEffectForExport(img, layer, s, textureScale);
    const filterStr = constructFilterString(layer.filters);
    if (drawLayerWithShadow(ctx, sourceForDraw, layer, filterStr, s)) return;
    ctx.save();
    applyRotation(ctx, layer, s);
    applyFlip(ctx, layer, s);
    if (filterStr) ctx.filter = filterStr;
    clipToCorners(ctx, layer, { x: layer.x * s, y: layer.y * s, width: layer.width * s, height: layer.height * s }, s);
    ctx.globalAlpha = layer.opacity;
    ctx.imageSmoothingEnabled = false;
    drawFitted(ctx, sourceForDraw, layer.fit, { x: layer.x * s, y: layer.y * s, width: layer.width * s, height: layer.height * s }, layer.crop);
    ctx.globalAlpha = 1;
    ctx.restore();
  } catch {
    /* skip */
  }
};

const drawAdjustmentLayer = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  layer: AdjustmentLayer,
  s: number,
  textureScale: number,
): Promise<void> => {
  const rx = Math.max(0, Math.round(layer.x * s));
  const ry = Math.max(0, Math.round(layer.y * s));
  const rw = Math.min(canvas.width - rx, Math.round(layer.width * s));
  const rh = Math.min(canvas.height - ry, Math.round(layer.height * s));
  if (rw <= 0 || rh <= 0) return;

  const processed = await processAdjustmentRegion(canvas, layer, s, { x: rx, y: ry, width: rw, height: rh }, textureScale);
  if (!processed) return;

  ctx.save();
  const filterStr = constructFilterString(layer.filters);
  if (filterStr) ctx.filter = filterStr;
  ctx.globalAlpha = layer.opacity;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(processed, 0, 0, processed.width, processed.height, rx, ry, rw, rh);
  ctx.restore();
};

const drawLayerByType = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  layer: Layer,
  s: number,
  imageDataUrl: string | null,
  textureScale: number,
): Promise<void> => {
  if (layer.type === "image") {
    const imageSrc = resolveAssetUrl((layer as ImageLayer).src) ?? imageDataUrl;
    if (imageSrc) await drawImageLayer(ctx, layer as ImageLayer, s, imageSrc, textureScale);
  }
  if (layer.type === "text") await drawText(ctx, layer as TextLayer, s);
  if (layer.type === "shape") await drawShapeLayer(ctx, layer as ShapeLayer, s);
  if (layer.type === "upload") await drawUploadLayer(ctx, layer as UploadLayer, s, textureScale);
  if (layer.type === "vector") await drawVectorLayer(ctx, layer as VectorLayer, s);
  if (layer.type === "ink") await drawInkLayer(ctx, layer as InkLayer, s);
  if (layer.type === "adjustment") await drawAdjustmentLayer(ctx, canvas, layer as AdjustmentLayer, s, textureScale);
};

const drawFlatLayer = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  layer: Layer,
  s: number,
  imageDataUrl: string | null,
  textureScale: number,
): Promise<void> => {
  if (!layer.visible) return;
  if (layer.blendMode && layer.blendMode !== "normal")
    ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
  await drawLayerByType(ctx, canvas, layer, s, imageDataUrl, textureScale);
  ctx.globalCompositeOperation = "source-over";
};

const applyOverlay = (
  ctx: CanvasRenderingContext2D,
  template: TemplateDef,
  s: number,
  canvasW: number,
  canvasH: number,
): void => {
  if (!template.overlay) return;
  const g = template.overlay;
  const grad = ctx.createLinearGradient(g.x0 * s, g.y0 * s, g.x1 * s, g.y1 * s);
  g.stops.forEach((stop) => grad.addColorStop(stop.pos, stop.color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);
};

export const renderToCanvas = async (
  template: TemplateDef,
  background: string,
  layers: Layer[],
  imageDataUrl: string | null,
  targetW: number,
  targetH: number,
  textureScale: number = 1,
): Promise<HTMLCanvasElement> => {
  const s = targetW / template.width;
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await registerAdminFonts();

  const pageBounds = { x: 0, y: 0, width: template.width, height: template.height };
  const flatLayers = flattenLayers(syncHugSizes(layersInsideBounds(layers, pageBounds)));

  const drawItems = async (target: CanvasRenderingContext2D, targetCanvas: HTMLCanvasElement, items: FlatItem[]): Promise<void> => {
    for (const item of items) {
      if (isMaskScope(item)) await drawMaskScope(target, targetCanvas, item, drawItems);
      else await drawFlatLayer(target, targetCanvas, item, s, imageDataUrl, textureScale);
    }
  };
  await drawItems(ctx, canvas, flatLayers);

  applyOverlay(ctx, template, s, canvas.width, canvas.height);
  return canvas;
};
