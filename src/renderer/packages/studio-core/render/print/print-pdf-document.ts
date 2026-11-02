import { jsPDF } from "jspdf";
import type { PrintLayout } from "./print-layout";

const PRINT_JPEG_QUALITY = 0.95;
const PDF_UNIT = "mm";

type Orientation = "portrait" | "landscape";

const orientationOf = (layout: PrintLayout): Orientation =>
  layout.sheetWidthMm > layout.sheetHeightMm ? "landscape" : "portrait";

const sheetFormat = (layout: PrintLayout): [number, number] => [layout.sheetWidthMm, layout.sheetHeightMm];

export const createPrintDocument = (layout: PrintLayout): jsPDF =>
  new jsPDF({
    unit: PDF_UNIT,
    format: sheetFormat(layout),
    orientation: orientationOf(layout),
    compress: true,
  });

export const addPrintPage = (doc: jsPDF, layout: PrintLayout): void => {
  doc.addPage(sheetFormat(layout), orientationOf(layout));
};

export const placeBledImage = (doc: jsPDF, canvas: HTMLCanvasElement, layout: PrintLayout): void => {
  const dataUrl = canvas.toDataURL("image/jpeg", PRINT_JPEG_QUALITY);
  const x = layout.trimXMm - layout.bleedMm;
  const y = layout.trimYMm - layout.bleedMm;
  const width = layout.trimWidthMm + layout.bleedMm * 2;
  const height = layout.trimHeightMm + layout.bleedMm * 2;
  doc.addImage(dataUrl, "JPEG", x, y, width, height, undefined, "NONE");
};
