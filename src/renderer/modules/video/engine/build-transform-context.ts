import type { TransformContext } from "../../../engine/types";
import type { EffectParams } from "../types";
import { hexToRgbTuple } from "../utils/color-parse";
import { orientRamp, ASCII_DETAILED } from "../../../engine/plugins/ascii";

const POPART_DEFAULT_INK: [number, number, number] = [220, 38, 38];
const POPART_DEFAULT_PAPER: [number, number, number] = [10, 10, 10];
const DUOTONE_DEFAULT_SHADOW: [number, number, number] = [30, 27, 75];
const DUOTONE_DEFAULT_HIGHLIGHT: [number, number, number] = [253, 230, 138];
const WASH_DEFAULT: [number, number, number] = [59, 130, 246];

export interface ContextSeeds {
  frameSeed: number;
  popartFrameSeed: number;
  halftoneFrameSeed: number;
}

export function buildTransformContext(
  data: Float32Array,
  width: number,
  height: number,
  params: Partial<EffectParams>,
  seeds: ContextSeeds,
): TransformContext {
  return {
    data,
    width,
    height,
    contrast: params.contrast ?? 1,
    brightness: params.brightness ?? 1,
    saturation: params.saturation ?? 1,
    isColor: params.isColor ?? true,
    ditherMethod: params.ditherMethod,
    ditherFactor: params.ditherFactor ?? 1,
    palette: params.palette ?? undefined,
    lutId: params.lutId ?? undefined,
    asciiCharset: orientRamp(params.asciiCharset ?? ASCII_DETAILED, params.asciiTone ?? "dark"),
    asciiEdges: params.asciiEdges,
    asciiEdgeThreshold: params.asciiEdgeThreshold,
    contourLevels: params.contourLevels,
    contourFill: params.contourFill,
    photocopyContrast: params.photocopyContrast,
    photocopyThreshold: params.photocopyThreshold,
    misprintAmount: params.misprintAmount,
    misprintAngle: params.misprintAngle,
    foldCount: params.foldCount,
    foldIntensity: params.foldIntensity,
    dustAmount: params.dustAmount,
    dustScratches: params.dustScratches,
    dustSeed: params.dustSeed,
    hazeIntensity: params.hazeIntensity,
    bloomIntensity: params.bloomIntensity,
    bloomThreshold: params.bloomThreshold,
    hazeWarmth: params.hazeWarmth,
    hazeTint: params.hazeTint
      ? hexToRgbTuple(params.hazeTint, [255, 255, 255])
      : undefined,
    halftoneCell: params.halftoneCell,
    halftoneAngle: params.halftoneAngle,
    halftoneStyle: params.halftoneStyle,
    halftoneShape: params.halftoneShape,
    halftoneInvert: params.halftoneInvert,
    halftoneIntensity: params.halftoneIntensity,
    halftoneSharpness: params.halftoneSharpness,
    voronoiCell: params.voronoiCell,
    voronoiJitter: params.voronoiJitter,
    voronoiEdge: params.voronoiEdge,
    scanlineSpacing: params.scanlineSpacing,
    scanlineIntensity: params.scanlineIntensity,
    scanlineRgbShift: params.scanlineRgbShift,
    scanlineCurvature: params.scanlineCurvature,
    chromaticIntensity: params.chromaticIntensity,
    chromaticFalloff: params.chromaticFalloff,
    crosshatchSpacing: params.crosshatchSpacing,
    crosshatchThickness: params.crosshatchThickness,
    popartCell: params.popartCell,
    popartAngle: params.popartAngle,
    popartThreshold: params.popartThreshold,
    popartGrain: params.popartGrain,
    popartSpatter: params.popartSpatter,
    popartInk: hexToRgbTuple(params.popartInkColor, POPART_DEFAULT_INK),
    popartPaper: hexToRgbTuple(params.popartPaperColor, POPART_DEFAULT_PAPER),
    gradeTemperature: params.gradeTemperature,
    gradeTint: params.gradeTint,
    gradeVibrance: params.gradeVibrance,
    duotoneShadow: hexToRgbTuple(params.duotoneShadow, DUOTONE_DEFAULT_SHADOW),
    duotoneHighlight: hexToRgbTuple(
      params.duotoneHighlight,
      DUOTONE_DEFAULT_HIGHLIGHT,
    ),
    duotoneAmount: params.duotoneAmount,
    vignetteAmount: params.vignetteAmount,
    vignetteRadius: params.vignetteRadius,
    vignetteSoftness: params.vignetteSoftness,
    posterizeLevels: params.posterizeLevels,
    sharpenAmount: params.sharpenAmount,
    washColor: hexToRgbTuple(params.washColor, WASH_DEFAULT),
    washIntensity: params.washIntensity,
    washMode: params.washMode,
    hue: params.hue,
    noise: params.noise,
    frameSeed: seeds.frameSeed,
    popartFrameSeed: seeds.popartFrameSeed,
    halftoneFrameSeed: seeds.halftoneFrameSeed,
  };
}
