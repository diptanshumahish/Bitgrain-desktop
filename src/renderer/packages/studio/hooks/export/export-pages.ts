import { zipSync, strToU8 } from "fflate";
import type {
  TemplateDef,
  TemplatePage,
} from "@bitgrain/studio-core/model/studio-types";
import { applyPngWatermark } from "@bitgrain/engine/watermark/watermark";
import { canvasToHdrBlob } from "@bitgrain/engine/export/hdr-png-encoder";
import { STUDIO_HDR_FORMAT } from "../../panels/export-state";
import { renderToCanvas } from "@bitgrain/studio-core/render/render-canvas";
import { toDesignFileName, toPageFileName } from "../../io/design-file-name";
import { studioWorkNameSignal } from "../../state/studio-work-name";
import { resolvePagesInstances } from "@bitgrain/studio-core/components/core/resolve-pages";
import { downloadBlob } from "@bitgrain/core/files/download-blob";

type MultiExportFormat =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/hdr-png";
export type MultiExportMode = "separate" | "zip";

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

const SEPARATE_DELAY_MS = 600;

const safeFilename = (value: string): string =>
  value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "page";

export const renderPageToCanvas = async (
  page: TemplatePage,
  template: TemplateDef,
  fallbackImage: string | null,
  scale: number,
  watermark: boolean,
  textureScale: number = 1,
): Promise<HTMLCanvasElement> => {
  const [outW, outH] = pageDims(page, scale);
  const canvas = await renderToCanvas(
    { ...template, width: page.width, height: page.height },
    page.background,
    page.layers,
    page.image ?? fallbackImage,
    outW,
    outH,
    textureScale,
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


const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const exportPagesAsSeparate = async ({
  template,
  pages,
  image,
  scale,
  format,
  quality,
  watermark = false,
}: MultiExportArgs): Promise<void> => {
  const ext = EXT_BY_FORMAT[format];
  const blobs: Blob[] = [];
  for (const page of pages) {
    const canvas = await renderPageToCanvas(page, template, image, scale, watermark);
    blobs.push(await canvasToBlob(canvas, format, quality));
  }
  for (let index = 0; index < blobs.length; index++) {
    downloadBlob(blobs[index], `${toPageFileName(studioWorkNameSignal.value, index + 1, blobs.length)}.${ext}`);
    await wait(SEPARATE_DELAY_MS);
  }
};

const exportPagesAsZip = async ({
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
  downloadBlob(blob, `${toDesignFileName(studioWorkNameSignal.value)}.zip`);
};

export const exportPagesByMode = async (
  mode: MultiExportMode,
  args: MultiExportArgs,
): Promise<void> => {
  const resolved: MultiExportArgs = { ...args, pages: resolvePagesInstances(args.pages) };
  if (mode === "zip") return exportPagesAsZip(resolved);
  return exportPagesAsSeparate(resolved);
};
