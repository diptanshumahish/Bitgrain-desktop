import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { renderPageToCanvas } from "../export-pages";
import { toDesignFileName } from "../../../io/design-file-name";
import { studioWorkNameSignal } from "../../../state/studio-work-name";
import { extendCanvasBleed } from "@bitgrain/studio-core/render/print/edge-bleed";
import { drawCropMarks } from "@bitgrain/studio-core/render/print/crop-marks";
import { bleedPixelsFor, computePrintLayout } from "@bitgrain/studio-core/render/print/print-layout";
import type { PrintLayout } from "@bitgrain/studio-core/render/print/print-layout";
import { printEnlargement, resolveTargetPrintSize } from "@bitgrain/studio-core/render/print/paper-target";
import { addPrintPage, createPrintDocument, placeBledImage } from "@bitgrain/studio-core/render/print/print-pdf-document";

export interface PrintPdfArgs {
  template: TemplateDef;
  pages: TemplatePage[];
  image: string | null;
  scale: number;
  watermark: boolean;
  paperName: string | null;
  lockDotSize: boolean;
  maxLongEdge: number | null;
}

const layoutForPage = (page: TemplatePage, paperName: string | null): PrintLayout =>
  computePrintLayout(resolveTargetPrintSize(page.width, page.height, paperName));

const clampScale = (page: TemplatePage, scale: number, maxLongEdge: number | null): number => {
  const longEdge = Math.max(page.width, page.height) * scale;
  if (!maxLongEdge || longEdge <= maxLongEdge) return scale;
  return scale * (maxLongEdge / longEdge);
};

export const printPageScale = (page: TemplatePage, args: PrintPdfArgs): number =>
  clampScale(page, args.scale * printEnlargement(page.width, page.height, args.paperName), args.maxLongEdge);

const textureScaleFor = (page: TemplatePage, args: PrintPdfArgs): number =>
  args.lockDotSize ? 1 / printEnlargement(page.width, page.height, args.paperName) : 1;

const renderBledPage = async (
  page: TemplatePage,
  args: PrintPdfArgs,
  layout: PrintLayout,
): Promise<HTMLCanvasElement> => {
  const canvas = await renderPageToCanvas(
    page, args.template, args.image, printPageScale(page, args), args.watermark, textureScaleFor(page, args),
  );
  return extendCanvasBleed(canvas, bleedPixelsFor(canvas.width, layout));
};

export const exportPrintPdf = async (args: PrintPdfArgs): Promise<void> => {
  if (args.pages.length === 0) return;
  const layouts = args.pages.map((page) => layoutForPage(page, args.paperName));
  const doc = createPrintDocument(layouts[0]);
  for (let index = 0; index < args.pages.length; index++) {
    const layout = layouts[index];
    if (index > 0) addPrintPage(doc, layout);
    const canvas = await renderBledPage(args.pages[index], args, layout);
    placeBledImage(doc, canvas, layout);
    drawCropMarks(doc, layout);
  }
  doc.save(`${toDesignFileName(studioWorkNameSignal.value)} print.pdf`);
};
