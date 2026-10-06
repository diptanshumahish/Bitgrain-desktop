import { renderToCanvas } from "../../studio/hooks/export/render-canvas";
import type { TemplateDef, Layer } from "../../../data/studioTypes";

const TRANSPARENT = "transparent";
const ALPHA_THRESHOLD = 4;
const PADDING_FRACTION = 0.01;
const MIN_PADDING = 2;

export type ArtworkSourceKind = "design" | "layer" | "upload";

export interface ArtworkRequest {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  width: number;
  height: number;
}

const findContentBounds = (canvas: HTMLCanvasElement): DOMRect | null => {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (data[(y * canvas.width + x) * 4 + 3] < ALPHA_THRESHOLD) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return new DOMRect(minX, minY, maxX - minX + 1, maxY - minY + 1);
};

export const cropToContent = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const bounds = findContentBounds(canvas);
  if (!bounds) return canvas;

  const padding = Math.max(MIN_PADDING, Math.round(Math.max(bounds.width, bounds.height) * PADDING_FRACTION));
  const cropped = document.createElement("canvas");
  cropped.width = bounds.width + padding * 2;
  cropped.height = bounds.height + padding * 2;
  const context = cropped.getContext("2d");
  if (!context) return canvas;
  context.drawImage(canvas, bounds.x, bounds.y, bounds.width, bounds.height, padding, padding, bounds.width, bounds.height);
  return cropped;
};

export const renderWholeDesign = async (request: ArtworkRequest): Promise<HTMLCanvasElement> => {
  const { template, background, layers, image, width, height } = request;
  return renderToCanvas({ ...template, width, height }, background, layers, image, width, height);
};

export const renderLayerArtwork = async (request: ArtworkRequest, layer: Layer): Promise<HTMLCanvasElement> => {
  const { template, image, width, height } = request;
  const rendered = await renderToCanvas({ ...template, width, height, overlay: undefined }, TRANSPARENT, [layer], image, width, height);
  return cropToContent(rendered);
};

export const canvasFromImage = (image: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (context) context.drawImage(image, 0, 0);
  return cropToContent(canvas);
};
