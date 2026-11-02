import type { AsciiTone, TransformMode } from "../../engine/types";
import { inkForPaper, isPaperHex, paperHexToRgb, rgbToPaperHex, toneForPaper, type PaperRgb } from "../../engine/tone/paper";
import { asciiSurface } from "./render-helpers";

export interface SurfaceRequest {
  lastMode: TransformMode;
  asciiTone?: AsciiTone;
  paperColor?: string | null;
  fgColor: string;
  bgColor: string;
}

export interface Surface {
  fg: string;
  bg: string;
}

const isCharSurfaceMode = (mode: TransformMode): boolean => mode === "ascii" || mode === "braille";

export const paperRgbFor = (paperColor: string | null | undefined): PaperRgb | undefined =>
  isPaperHex(paperColor) ? paperHexToRgb(paperColor) : undefined;

export const effectiveAsciiTone = (tone: AsciiTone | undefined, paperColor: string | null | undefined): AsciiTone =>
  toneForPaper(paperColor, tone ?? "dark");

export const resolveSurface = (request: SurfaceRequest): Surface => {
  const paper = paperRgbFor(request.paperColor);
  if (paper && request.paperColor) return { fg: rgbToPaperHex(inkForPaper(paper)), bg: request.paperColor };
  if (!isCharSurfaceMode(request.lastMode)) return { fg: request.fgColor, bg: request.bgColor };
  return asciiSurface(request.lastMode === "braille" ? "dark" : request.asciiTone ?? "dark");
};
