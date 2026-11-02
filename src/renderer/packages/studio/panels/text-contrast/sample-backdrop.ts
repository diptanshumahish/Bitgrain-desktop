import { rgbToHex } from "@bitgrain/core/color/color-theory";
import { pageRenderTemplate } from "../../canvas/page-snapshot/page-render-template";
import { withLookPreviews } from "../../canvas/page-snapshot/look-preview-layers";
import type { Backdrop } from "./resolve-backdrop";
import { layersReachingRect } from "./backdrop-layers";

const SAMPLE_LONG_EDGE = 320;
const RGBA_STRIDE = 4;

type ImageBackdrop = Extract<Backdrop, { kind: "image" }>;

const averageColor = (pixels: Uint8ClampedArray): string => {
  const totals = [0, 0, 0];
  const count = pixels.length / RGBA_STRIDE;
  for (let index = 0; index < pixels.length; index += RGBA_STRIDE) {
    totals[0] += pixels[index];
    totals[1] += pixels[index + 1];
    totals[2] += pixels[index + 2];
  }
  return rgbToHex([totals[0] / count, totals[1] / count, totals[2] / count]);
};

const renderBackdrop = async (backdrop: ImageBackdrop, width: number, height: number, signal: AbortSignal): Promise<HTMLCanvasElement | null> => {
  const { renderToCanvas } = await import("@bitgrain/studio-core/render/render-canvas");
  const { page, rect } = backdrop;
  const pageImage = page.image ?? null;
  const preview = await withLookPreviews(layersReachingRect(backdrop.layers, rect), pageImage, null);
  try {
    if (signal.aborted) return null;
    return await renderToCanvas(pageRenderTemplate(page), page.background, preview.layers, pageImage, width, height);
  } finally {
    preview.release();
  }
};

export const sampleBackdropColor = async (backdrop: ImageBackdrop, signal: AbortSignal): Promise<string | null> => {
  const { page, rect } = backdrop;
  const scale = Math.min(1, SAMPLE_LONG_EDGE / Math.max(page.width, page.height));
  const width = Math.max(1, Math.round(page.width * scale));
  const height = Math.max(1, Math.round(page.height * scale));
  const canvas = await renderBackdrop(backdrop, width, height, signal);
  if (!canvas || signal.aborted) return null;
  const left = Math.max(0, Math.floor(rect.x * scale));
  const top = Math.max(0, Math.floor(rect.y * scale));
  const cropWidth = Math.min(width - left, Math.max(1, Math.ceil(rect.width * scale)));
  const cropHeight = Math.min(height - top, Math.max(1, Math.ceil(rect.height * scale)));
  if (cropWidth <= 0 || cropHeight <= 0) return null;
  const context = canvas.getContext("2d");
  if (!context) return null;
  return averageColor(context.getImageData(left, top, cropWidth, cropHeight).data);
};
