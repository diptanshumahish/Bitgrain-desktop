import { zipSync, strToU8 } from "fflate";
import { jsPDF } from "jspdf";
import type {
  TemplateDef,
  TemplatePage,
} from "../../../../data/studioTypes";
import { applyPngWatermark } from "../../../../engine/watermark";
import { canvasToHdrBlob } from "../../../../engine/export/hdr-png-encoder";
import { STUDIO_HDR_FORMAT } from "../../panels/export-state";
import { renderToCanvas } from "./render-canvas";

export type MultiExportFormat =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/hdr-png";
export type MultiExportMode = "separate" | "zip" | "pdf";

export interface MultiExportArgs {
  template: TemplateDef;
  pages: TemplatePage[];
  image: string | null;
  scale: number;
  format: MultiExportFormat;
  quality: number;
  watermark?: boolean;
}

const pageDims = (page: TemplatePage, scale: number): [number, number] => [
  Math.max(1, Math.round(page.width * scale)),
  Math.max(1, Math.round(page.height * scale)),
];

const EXT_BY_FORMAT: Record<MultiExportFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/hdr-png": "png",
};

const SEPARATE_DELAY_MS = 150;
const PDF_PIXEL_UNIT = "px";

const safeFilename = (value: string): string =>
  value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "page";

const renderPageToCanvas = async (
  page: TemplatePage,
  template: TemplateDef,
  fallbackImage: string | null,
  scale: number,
  watermark: boolean,
): Promise<HTMLCanvasElement> => {
  const [outW, outH] = pageDims(page, scale);
  const canvas = await renderToCanvas(
    { ...template, width: page.width, height: page.height },
    page.background,
    page.layers,
    page.image ?? fallbackImage,
    outW,
    outH,
  );
  if (watermark) {
    await applyPngWatermark(canvas);
  }
  return canvas;
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: MultiExportFormat,
  quality: number,
): Promise<Blob> => {
  if (format === STUDIO_HDR_FORMAT) return canvasToHdrBlob(canvas);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      format,
      quality,
    );
  });
};

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const exportPagesAsSeparate = async ({
  template,
  pages,
  image,
  scale,
  format,
  quality,
  watermark = false,
}: MultiExportArgs): Promise<void> => {
  const ext = EXT_BY_FORMAT[format];
  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const canvas = await renderPageToCanvas(page, template, image, scale, watermark);
    const blob = await canvasToBlob(canvas, format, quality);
    const name = `${safeFilename(template.id)}-${String(index + 1).padStart(2, "0")}-${safeFilename(page.name)}.${ext}`;
    triggerDownload(blob, name);
    await wait(SEPARATE_DELAY_MS);
  }
};

export const exportPagesAsZip = async ({
  template,
  pages,
  image,
  scale,
  format,
  quality,
  watermark = false,
}: MultiExportArgs): Promise<void> => {
  const ext = EXT_BY_FORMAT[format];
  const files: Record<string, Uint8Array> = {};
  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const canvas = await renderPageToCanvas(page, template, image, scale, watermark);
    const blob = await canvasToBlob(canvas, format, quality);
    const buffer = new Uint8Array(await blob.arrayBuffer());
    const name = `${String(index + 1).padStart(2, "0")}-${safeFilename(page.name)}.${ext}`;
    files[name] = buffer;
  }
  files["manifest.txt"] = strToU8(
    pages
      .map((page, index) => `${index + 1}\t${page.name}`)
      .join("\n"),
  );
  const zipped = zipSync(files, { level: 0 });
  const blob = new Blob([new Uint8Array(zipped)], { type: "application/zip" });
  triggerDownload(blob, `${safeFilename(template.id)}-pages.zip`);
};

export const exportPagesAsPdf = async ({
  template,
  pages,
  image,
  scale,
  watermark = false,
}: MultiExportArgs): Promise<void> => {
  const [firstW, firstH] = pageDims(pages[0], scale);
  const doc = new jsPDF({
    unit: PDF_PIXEL_UNIT,
    format: [firstW, firstH],
    orientation: firstW >= firstH ? "landscape" : "portrait",
    compress: true,
  });

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const [outW, outH] = pageDims(page, scale);
    const canvas = await renderPageToCanvas(page, template, image, scale, watermark);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    if (index > 0) {
      doc.addPage([outW, outH], outW >= outH ? "landscape" : "portrait");
    }
    doc.addImage(dataUrl, "JPEG", 0, 0, outW, outH, undefined, "FAST");
  }
  doc.save(`${safeFilename(template.id)}-pages.pdf`);
};

export const exportPagesByMode = async (
  mode: MultiExportMode,
  args: MultiExportArgs,
): Promise<void> => {
  if (mode === "zip") return exportPagesAsZip(args);
  if (mode === "pdf") return exportPagesAsPdf(args);
  return exportPagesAsSeparate(args);
};
