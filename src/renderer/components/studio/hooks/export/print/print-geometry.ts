import { MM_PER_INCH, PAPER_SIZES, PRINT_DPI } from "./paper-sizes";
import type { PaperSize } from "./paper-sizes";

export interface PrintSize {
  widthMm: number;
  heightMm: number;
  paperName: string | null;
}

const MATCH_TOLERANCE = 0.02;
const STANDARD_DENSITIES = [72, 96, 150, 200, 300, 400, 600];
const MM_DECIMALS = 2;

const isClose = (value: number, target: number): boolean =>
  Math.abs(value - target) / target <= MATCH_TOLERANCE;

const pixelsToMm = (pixels: number, dpi: number): number =>
  Number(((pixels / dpi) * MM_PER_INCH).toFixed(MM_DECIMALS));

const orientedTo = (paper: PaperSize, width: number, height: number): PaperSize => {
  const isLandscape = width > height;
  const paperIsLandscape = paper.widthMm > paper.heightMm;
  if (isLandscape === paperIsLandscape) return paper;
  return { name: paper.name, widthMm: paper.heightMm, heightMm: paper.widthMm };
};

const matchesAtDensity = (width: number, height: number, paper: PaperSize, dpi: number): boolean =>
  isClose(pixelsToMm(width, dpi), paper.widthMm) && isClose(pixelsToMm(height, dpi), paper.heightMm);

const findPaper = (width: number, height: number): PaperSize | undefined =>
  PAPER_SIZES.map((paper) => orientedTo(paper, width, height)).find((paper) =>
    STANDARD_DENSITIES.some((dpi) => matchesAtDensity(width, height, paper, dpi)),
  );

export const resolvePrintSize = (pageWidth: number, pageHeight: number): PrintSize => {
  const paper = findPaper(pageWidth, pageHeight);
  if (paper) return { widthMm: paper.widthMm, heightMm: paper.heightMm, paperName: paper.name };
  return {
    widthMm: pixelsToMm(pageWidth, PRINT_DPI),
    heightMm: pixelsToMm(pageHeight, PRINT_DPI),
    paperName: null,
  };
};

export const describePrintSize = (size: PrintSize): string => {
  const dims = `${Math.round(size.widthMm)} × ${Math.round(size.heightMm)} mm`;
  return size.paperName ? `${size.paperName}, ${dims}` : dims;
};
