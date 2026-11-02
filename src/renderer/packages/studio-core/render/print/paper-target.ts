import { PAPER_SIZES } from "./paper-sizes";
import type { PaperSize } from "./paper-sizes";
import { resolvePrintSize } from "./print-geometry";
import type { PrintSize } from "./print-geometry";

const ASPECT_TOLERANCE = 0.005;

const aspectOf = (widthMm: number, heightMm: number): number =>
  Math.max(widthMm, heightMm) / Math.min(widthMm, heightMm);

const sharesAspect = (paper: PaperSize, size: PrintSize): boolean => {
  const target = aspectOf(size.widthMm, size.heightMm);
  return Math.abs(aspectOf(paper.widthMm, paper.heightMm) - target) / target <= ASPECT_TOLERANCE;
};

export const papersMatchingAspect = (size: PrintSize): PaperSize[] =>
  PAPER_SIZES.filter((paper) => sharesAspect(paper, size));

const orientLike = (paper: PaperSize, size: PrintSize): PrintSize => {
  const longMm = Math.max(paper.widthMm, paper.heightMm);
  const shortMm = Math.min(paper.widthMm, paper.heightMm);
  const isLandscape = size.widthMm > size.heightMm;
  return {
    widthMm: isLandscape ? longMm : shortMm,
    heightMm: isLandscape ? shortMm : longMm,
    paperName: paper.name,
  };
};

export const resolveTargetPrintSize = (pageWidth: number, pageHeight: number, paperName: string | null): PrintSize => {
  const native = resolvePrintSize(pageWidth, pageHeight);
  const paper = papersMatchingAspect(native).find((candidate) => candidate.name === paperName);
  return paper ? orientLike(paper, native) : native;
};

export const printEnlargement = (pageWidth: number, pageHeight: number, paperName: string | null): number => {
  const native = resolvePrintSize(pageWidth, pageHeight);
  const target = resolveTargetPrintSize(pageWidth, pageHeight, paperName);
  return target.widthMm / native.widthMm;
};
