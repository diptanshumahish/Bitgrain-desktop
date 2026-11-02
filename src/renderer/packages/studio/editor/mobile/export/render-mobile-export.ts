import type { Layer, TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import { renderToCanvas } from "@bitgrain/studio-core/render/render-canvas";
import { applyPngWatermark } from "@bitgrain/engine/watermark/watermark";
import { toDesignFileName } from "../../../io/design-file-name";
import { studioWorkNameSignal } from "../../../state/studio-work-name";
import type { MobileExportFormat } from "./mobile-export-state";

interface MobileRenderRequest {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  width: number;
  height: number;
  format: MobileExportFormat;
  watermark: boolean;
}

const JPEG_QUALITY = 0.92;
const JPEG_BACKDROP = "#ffffff";

const flattenForJpeg = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const flat = document.createElement("canvas");
  flat.width = canvas.width;
  flat.height = canvas.height;
  const context = flat.getContext("2d");
  if (!context) return canvas;
  context.fillStyle = JPEG_BACKDROP;
  context.fillRect(0, 0, flat.width, flat.height);
  context.drawImage(canvas, 0, 0);
  return flat;
};

const canvasToBlob = (canvas: HTMLCanvasElement, format: MobileExportFormat): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const source = format === "image/jpeg" ? flattenForJpeg(canvas) : canvas;
    source.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("This export size is too large for your phone. Try a smaller size."))),
      format,
      JPEG_QUALITY,
    );
  });

export const renderMobileExport = async (request: MobileRenderRequest): Promise<File> => {
  const { template, background, layers, image, width, height, format, watermark } = request;
  const canvas = await renderToCanvas(template, background, layers, image, width, height);
  if (watermark) await applyPngWatermark(canvas);
  const blob = await canvasToBlob(canvas, format);
  const extension = format === "image/jpeg" ? "jpg" : "png";
  return new File([blob], `${toDesignFileName(studioWorkNameSignal.value)}.${extension}`, { type: format });
};
