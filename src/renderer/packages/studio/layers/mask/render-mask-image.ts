import type { Layer, TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import type { MaskBounds } from "@bitgrain/studio-core/mask/mask-bounds";
import { maskRenderLayer } from "@bitgrain/studio-core/mask/mask-source-layer";
import { renderToCanvas } from "@bitgrain/studio-core/render/render-canvas";

const MAX_MASK_PIXELS = 4096;

export const maskResolution = (bounds: MaskBounds, scale: number, pixelRatio: number): number =>
  Math.min(scale * pixelRatio, MAX_MASK_PIXELS / Math.max(1, bounds.width, bounds.height));

const maskTemplate = (bounds: MaskBounds, layers: Layer[]): TemplateDef => ({
  id: "mask",
  name: "Mask",
  category: "poster",
  width: bounds.width,
  height: bounds.height,
  background: "transparent",
  exportScale: 1,
  layers,
});

const canvasToObjectUrl = (canvas: HTMLCanvasElement): Promise<string> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("mask raster failed"))));
  });

export const renderMaskImage = async (mask: Layer, bounds: MaskBounds, resolution: number, pageImage: string | null): Promise<string> => {
  const shifted = { ...maskRenderLayer(mask), x: mask.x - bounds.x, y: mask.y - bounds.y } as Layer;
  const width = Math.max(1, Math.round(bounds.width * resolution));
  const height = Math.max(1, Math.round(bounds.height * resolution));
  const canvas = await renderToCanvas(maskTemplate(bounds, [shifted]), "transparent", [shifted], pageImage, width, height);
  return canvasToObjectUrl(canvas);
};
