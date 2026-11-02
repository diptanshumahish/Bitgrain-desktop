import type { jsPDF } from "jspdf";
import { CROP_MARK_LENGTH_MM, CROP_MARK_WIDTH_MM } from "./print-layout";
import type { PrintLayout } from "./print-layout";

const REGISTRATION_BLACK = 0;

interface Corner {
  x: number;
  y: number;
  horizontalDirection: number;
  verticalDirection: number;
}

const trimCorners = (layout: PrintLayout): Corner[] => {
  const left = layout.trimXMm;
  const top = layout.trimYMm;
  const right = left + layout.trimWidthMm;
  const bottom = top + layout.trimHeightMm;
  return [
    { x: left, y: top, horizontalDirection: -1, verticalDirection: -1 },
    { x: right, y: top, horizontalDirection: 1, verticalDirection: -1 },
    { x: left, y: bottom, horizontalDirection: -1, verticalDirection: 1 },
    { x: right, y: bottom, horizontalDirection: 1, verticalDirection: 1 },
  ];
};

const drawCornerMarks = (doc: jsPDF, corner: Corner, bleedMm: number): void => {
  const start = bleedMm;
  const end = bleedMm + CROP_MARK_LENGTH_MM;
  const { x, y, horizontalDirection, verticalDirection } = corner;
  doc.line(x + horizontalDirection * start, y, x + horizontalDirection * end, y);
  doc.line(x, y + verticalDirection * start, x, y + verticalDirection * end);
};

export const drawCropMarks = (doc: jsPDF, layout: PrintLayout): void => {
  doc.setDrawColor(REGISTRATION_BLACK);
  doc.setLineWidth(CROP_MARK_WIDTH_MM);
  trimCorners(layout).forEach((corner) => drawCornerMarks(doc, corner, layout.bleedMm));
};
