import { jsPDF } from "jspdf";
import type { TemplateDef, TemplatePage } from "../../../../../data/studioTypes";
import { renderPageToCanvas } from "../export-pages";
import { toDesignFileName } from "../../../../../lib/design-file-name";
import { studioWorkNameSignal } from "../../../../../store/studio-work-name";
import { extendCanvasBleed } from "./edge-bleed";
import { drawCropMarks } from "./crop-marks";
import { resolvePrintSize } from "./print-geometry";
import { bleedPixelsFor, computePrintLayout } from "./print-layout";
import type { PrintLayout } from "./print-layout";

export interface PrintPdfArgs {
  template: TemplateDef;
  pages: TemplatePage[];
  image: string | null;
  scale: number;
  watermark: boolean;
}

const PRINT_JPEG_QUALITY = 0.95;
const PDF_UNIT = "mm";

type Orientation = "portrait" | "landscape";

const orientationOf = (layout: PrintLayout): Orientation =>
  layout.sheetWidthMm > layout.sheetHeightMm ? "landscape" : "portrait";

const sheetFormat = (layout: PrintLayout): [number, number] => [
  layout.sheetWidthMm,
  layout.sheetHeightMm,
];

const layoutForPage = (page: TemplatePage): PrintLayout =>
  computePrintLayout(resolvePrintSize(page.width, page.height));

const createDocument = (layout: PrintLayout): jsPDF =>
  new jsPDF({
    unit: PDF_UNIT,
    format: sheetFormat(layout),
    orientation: orientationOf(layout),
    compress: true,
  });

const placeBledImage = (doc: jsPDF, canvas: HTMLCanvasElement, layout: PrintLayout): void => {
  const dataUrl = canvas.toDataURL("image/jpeg", PRINT_JPEG_QUALITY);
  const x = layout.trimXMm - layout.bleedMm;
  const y = layout.trimYMm - layout.bleedMm;
  const width = layout.trimWidthMm + layout.bleedMm * 2;
  const height = layout.trimHeightMm + layout.bleedMm * 2;
  doc.addImage(dataUrl, "JPEG", x, y, width, height, undefined, "NONE");
};

const renderBledPage = async (
  page: TemplatePage,
  args: PrintPdfArgs,
  layout: PrintLayout,
): Promise<HTMLCanvasElement> => {
  const canvas = await renderPageToCanvas(page, args.template, args.image, args.scale, args.watermark);
  return extendCanvasBleed(canvas, bleedPixelsFor(canvas.width, layout));
};

export const exportPrintPdf = async (args: PrintPdfArgs): Promise<void> => {
  if (args.pages.length === 0) return;
  const layouts = args.pages.map(layoutForPage);
  const doc = createDocument(layouts[0]);
  for (let index = 0; index < args.pages.length; index++) {
    const layout = layouts[index];
    if (index > 0) doc.addPage(sheetFormat(layout), orientationOf(layout));
    const canvas = await renderBledPage(args.pages[index], args, layout);
    placeBledImage(doc, canvas, layout);
    drawCropMarks(doc, layout);
  }
  doc.save(`${toDesignFileName(studioWorkNameSignal.value)} print.pdf`);
};
