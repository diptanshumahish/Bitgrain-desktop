import type { TransformMode } from "../../engine/types";
import type { TransformSnapshot } from "../../store/transform-store";
import { orientRamp } from "../../engine/plugins/ascii";

export interface WorkerParamsResult {
  params: Record<string, unknown>;
  renderedAtScale: number;
}

const CHAR_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>([
  "dither", "ascii", "braille", "dot-matrix", "grunge", "blocky",
]);
const LUT_DEFAULT_RESOLUTION = 2.0;
const NEUTRAL_ADJUSTMENT = 1.0;

const resolveGradeModes = (rawModes: TransformMode[]): TransformMode[] =>
  rawModes.includes("haze-bloom") ? ["haze-bloom", "lut"] : ["lut"];

const resolveRenderModes = (snap: TransformSnapshot): TransformMode[] => {
  const rawModes = Array.isArray(snap.modes) ? snap.modes : [snap.modes];
  return snap.lutId ? resolveGradeModes(rawModes) : rawModes;
};

export const isCharBasedSnapshot = (snap: TransformSnapshot): boolean => {
  const modes = resolveRenderModes(snap);
  return CHAR_MODES.has(modes[modes.length - 1]);
};

const buildToneParams = (snap: TransformSnapshot): Record<string, unknown> => {
  const gradeOnly = !!snap.lutId;
  return {
    resolution: gradeOnly ? LUT_DEFAULT_RESOLUTION : snap.resolution,
    contrast: gradeOnly ? NEUTRAL_ADJUSTMENT : snap.contrast,
    brightness: gradeOnly ? NEUTRAL_ADJUSTMENT : snap.brightness,
    saturation: gradeOnly ? NEUTRAL_ADJUSTMENT : snap.saturation,
    isColor: gradeOnly ? true : snap.isColor,
    noise: gradeOnly ? 0 : snap.grain,
    hue: gradeOnly ? 0 : snap.hue,
    palette: gradeOnly ? null : snap.palette,
    lutId: snap.lutId,
  };
};

const buildEffectParams = (snap: TransformSnapshot): Record<string, unknown> => ({
  ditherMethod: snap.ditherMethod,
  ditherFactor: snap.ditherFactor,
  asciiCharset: orientRamp(snap.asciiCharset, snap.asciiTone),
  asciiDensity: snap.asciiDensity,
  asciiEdges: snap.asciiEdges,
  asciiEdgeThreshold: snap.asciiEdgeThreshold,
  contourLevels: snap.contourLevels,
  contourFill: snap.contourFill,
  hazeIntensity: snap.hazeIntensity,
  bloomIntensity: snap.bloomIntensity,
  bloomThreshold: snap.bloomThreshold,
  hazeWarmth: snap.hazeWarmth,
  halftoneCell: snap.halftoneCell,
  halftoneAngle: snap.halftoneAngle,
  halftoneStyle: snap.halftoneStyle,
  halftoneShape: snap.halftoneShape,
  halftoneInvert: snap.halftoneInvert,
  halftoneIntensity: snap.halftoneIntensity,
  halftoneSharpness: snap.halftoneSharpness,
  popartCell: snap.popartCell,
  popartAngle: snap.popartAngle,
  popartThreshold: snap.popartThreshold,
  popartGrain: snap.popartGrain,
  popartSpatter: snap.popartSpatter,
  popartInk: snap.popartInk,
  popartPaper: snap.popartPaper,
  inkwashDetail: snap.inkwashDetail,
  inkwashBands: snap.inkwashBands,
  inkwashBleed: snap.inkwashBleed,
  inkwashInk: snap.inkwashInk,
  inkwashPaper: snap.inkwashPaper,
  mangaCell: snap.mangaCell,
  mangaAngle: snap.mangaAngle,
  mangaLineWeight: snap.mangaLineWeight,
  mangaContrast: snap.mangaContrast,
});

export const snapshotToWorkerParams = (snap: TransformSnapshot, renderScale: number): WorkerParamsResult => {
  const modes = resolveRenderModes(snap);
  const scale = isCharBasedSnapshot(snap) ? 1 : renderScale;
  return {
    renderedAtScale: scale,
    params: {
      ...buildToneParams(snap),
      ...buildEffectParams(snap),
      modes,
      exportScale: scale,
    },
  };
};

export const snapshotToBatchParams = (snap: TransformSnapshot, nativeWidth: number): Record<string, unknown> => {
  const { params } = snapshotToWorkerParams(snap, 1);
  if (isCharBasedSnapshot(snap)) return params;
  return { ...params, exportTargetWidth: nativeWidth };
};
