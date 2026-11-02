import type { PrintSize } from "./print-geometry";

export const BLEED_MM = 3;
export const SAFE_ZONE_MM = 3;
export const SLUG_MM = 8;
export const CROP_MARK_LENGTH_MM = 5;
export const CROP_MARK_WIDTH_MM = 0.1;

export interface PrintLayout {
  sheetWidthMm: number;
  sheetHeightMm: number;
  trimXMm: number;
  trimYMm: number;
  trimWidthMm: number;
  trimHeightMm: number;
  bleedMm: number;
}

interface LayoutMargins {
  bleedMm: number;
  slugMm: number;
}

const STUDIO_MARGINS: LayoutMargins = { bleedMm: BLEED_MM, slugMm: SLUG_MM };

export const computePrintLayout = (size: PrintSize, margins: LayoutMargins = STUDIO_MARGINS): PrintLayout => {
  const margin = margins.bleedMm + margins.slugMm;
  return {
    sheetWidthMm: size.widthMm + margin * 2,
    sheetHeightMm: size.heightMm + margin * 2,
    trimXMm: margin,
    trimYMm: margin,
    trimWidthMm: size.widthMm,
    trimHeightMm: size.heightMm,
    bleedMm: margins.bleedMm,
  };
};

export const bleedPixelsFor = (canvasWidth: number, layout: PrintLayout): number =>
  Math.max(1, Math.round((canvasWidth / layout.trimWidthMm) * layout.bleedMm));
