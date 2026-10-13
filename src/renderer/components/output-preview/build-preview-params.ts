import type { OutputPreviewProps } from "./types";
import { buildWorkerMaskParams } from "../../modules/grading/editor/worker-mask-params";
import { HALFTONE_DEFAULTS, HALFTONE_LEGACY_CELL } from "../../engine/plugins/halftone/halftone-defaults";
import { linesFromSnapshot } from "../../engine/plugins/halftone/halftone-legacy";
import { saturationFor } from "./colour-saturation";
import { paperRgbFor } from "./paper-surface";

const DEFAULT_HAZE_INTENSITY = 0.3;
const DEFAULT_BLOOM_INTENSITY = 0.4;
const DEFAULT_BLOOM_THRESHOLD = 0.7;
const DEFAULT_HAZE_WARMTH = 0.6;

export const buildPreviewParams = (
  current: OutputPreviewProps,
  asciiCharset: string,
  asciiDensity: number,
): Record<string, unknown> => ({
  resolution: current.resolution,
  contrast: current.contrast,
  brightness: current.brightness,
  saturation: saturationFor(current.isColor, current.saturation),
  modes: current.mode,
  ditherMethod: current.ditherMethod,
  ditherFactor: current.ditherFactor ?? 1,
  isColor: current.isColor,
  asciiCharset,
  asciiDensity,
  asciiEdges: current.asciiEdges,
  asciiEdgeThreshold: current.asciiEdgeThreshold,
  contourLevels: current.contourLevels,
  contourFill: current.contourFill,
  noise: current.noise ?? 0,
  hue: current.hue ?? 0,
  palette: current.palette,
  paperColor: paperRgbFor(current.paperColor),
  lutId: current.lutId,
  hazeIntensity: current.hazeIntensity ?? DEFAULT_HAZE_INTENSITY,
  bloomIntensity: current.bloomIntensity ?? DEFAULT_BLOOM_INTENSITY,
  bloomThreshold: current.bloomThreshold ?? DEFAULT_BLOOM_THRESHOLD,
  hazeWarmth: current.hazeWarmth ?? DEFAULT_HAZE_WARMTH,
  halftoneCell: current.halftoneCell ?? HALFTONE_LEGACY_CELL,
  halftoneLines: linesFromSnapshot(current),
  halftoneAngle: current.halftoneAngle ?? HALFTONE_DEFAULTS.angle,
  halftoneStyle: current.halftoneStyle ?? HALFTONE_DEFAULTS.style,
  halftoneShape: current.halftoneShape ?? HALFTONE_DEFAULTS.shape,
  halftoneInvert: current.halftoneInvert ?? HALFTONE_DEFAULTS.invert,
  halftoneIntensity: current.halftoneIntensity ?? HALFTONE_DEFAULTS.intensity,
  halftoneSharpness: current.halftoneSharpness ?? HALFTONE_DEFAULTS.sharpness,
  halftoneGrit: current.halftoneGrit ?? HALFTONE_DEFAULTS.grit,
  halftoneSupersample: true,
  popartCell: current.popartCell,
  popartAngle: current.popartAngle,
  popartThreshold: current.popartThreshold,
  popartGrain: current.popartGrain,
  popartSpatter: current.popartSpatter,
  popartInk: current.popartInk,
  popartPaper: current.popartPaper,
  inkwashDetail: current.inkwashDetail,
  inkwashBands: current.inkwashBands,
  inkwashBleed: current.inkwashBleed,
  inkwashInk: current.inkwashInk,
  inkwashPaper: current.inkwashPaper,
  mangaCell: current.mangaCell,
  mangaAngle: current.mangaAngle,
  mangaLineWeight: current.mangaLineWeight,
  mangaContrast: current.mangaContrast,
  grade: current.grade,
  ...buildWorkerMaskParams(current.compact ? [] : current.masks, current.compact ? null : current.overlayMaskId),
});
