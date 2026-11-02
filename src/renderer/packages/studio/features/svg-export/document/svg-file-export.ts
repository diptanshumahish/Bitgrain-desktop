import { strToU8, zipSync } from "fflate";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { toDesignFileName, toPageFileName } from "../../../io/design-file-name";
import { studioWorkNameSignal } from "../../../state/studio-work-name";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { buildSvgDocument, type SvgDocumentResult } from "./build-svg-document";
import { downloadBlob } from "@bitgrain/core/files/download-blob";

const SVG_MIME = "image/svg+xml;charset=utf-8";
const ZIP_MIME = "application/zip";
const PAGE_NUMBER_WIDTH = 2;
const ZIP_LEVEL = 6;


export const notifySvgGaps = (skipped: string[]): void => {
  if (skipped.length === 0) return;
  const names = [...new Set(skipped)].join(", ");
  emitStatusToast({ title: "Some layers stayed out of the SVG", detail: `SVG has no way to show ${names}, so they were left out.` });
};

interface PageSvgOptions {
  fallbackImage: string | null;
  watermark: boolean;
  scale: number;
}

const pageSvg = (page: TemplatePage, options: PageSvgOptions): Promise<SvgDocumentResult> =>
  buildSvgDocument({
    layers: page.layers,
    width: page.width,
    height: page.height,
    scale: options.scale,
    offsetX: 0,
    offsetY: 0,
    background: page.background,
    fallbackImage: page.image ?? options.fallbackImage,
    watermark: options.watermark,
    idPrefix: `p${page.id.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}`,
  });

export const downloadSvg = (svg: string, baseName: string): void =>
  downloadBlob(new Blob([svg], { type: SVG_MIME }), `${baseName}.svg`);

export const exportPagesSvg = async (pages: TemplatePage[], options: PageSvgOptions): Promise<void> => {
  const designName = studioWorkNameSignal.value;
  const results = await Promise.all(pages.map((page) => pageSvg(page, options)));
  notifySvgGaps(results.flatMap((result) => result.skipped));
  if (results.length === 1) {
    downloadSvg(results[0].svg, toPageFileName(designName, 1, 1));
    return;
  }
  const files = Object.fromEntries(
    results.map((result, index) => [`${String(index + 1).padStart(PAGE_NUMBER_WIDTH, "0")}-${toPageFileName(designName, index + 1, results.length)}.svg`, strToU8(result.svg)]),
  );
  const zipped = zipSync(files, { level: ZIP_LEVEL });
  downloadBlob(new Blob([new Uint8Array(zipped)], { type: ZIP_MIME }), `${toDesignFileName(designName)}.zip`);
};
