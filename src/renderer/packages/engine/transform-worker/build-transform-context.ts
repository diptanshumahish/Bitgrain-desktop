import type { TransformContext } from "../core/types";
import { resolveBrushAlphas } from "../grading/mask/worker-brushes";
import { styleScaleFor } from "../styles/engine/style-scale";
import type { ProcessParams } from "./process-params";

interface ContextGeometry {
  pixels: Float32Array;
  sampleWidth: number;
  sampleHeight: number;
  cols: number;
  rows: number;
  sourceWidth: number;
  exportScale: number;
}

const scaleFeatureSize = (value: number | undefined, factor: number): number | undefined =>
  value === undefined ? undefined : value * factor;

const toneFields = (params: ProcessParams): Partial<TransformContext> => ({
  noise: params.noise,
  hue: params.hue,
  palette: params.palette,
  paperColor: params.paperColor,
  lutId: params.lutId,
  grade: params.grade,
});

const charFields = (params: ProcessParams): Partial<TransformContext> => ({
  asciiCharset: params.asciiCharset,
  asciiEdges: params.asciiEdges,
  asciiEdgeThreshold: params.asciiEdgeThreshold,
  contourLevels: params.contourLevels,
  contourFill: params.contourFill,
  ditherMethod: params.ditherMethod,
  ditherFactor: params.ditherFactor,
});

const lookFields = (params: ProcessParams, scale: number): Partial<TransformContext> => ({
  hazeIntensity: params.hazeIntensity,
  bloomIntensity: params.bloomIntensity,
  bloomThreshold: params.bloomThreshold,
  hazeWarmth: params.hazeWarmth,
  halftoneCell: scaleFeatureSize(params.halftoneCell, scale),
  halftoneLines: params.halftoneLines,
  halftoneAngle: params.halftoneAngle,
  halftoneStyle: params.halftoneStyle,
  halftoneShape: params.halftoneShape,
  halftoneInvert: params.halftoneInvert,
  halftoneIntensity: params.halftoneIntensity,
  halftoneSharpness: params.halftoneSharpness,
  halftoneGrit: params.halftoneGrit,
  halftoneSupersample: params.halftoneSupersample,
  popartCell: scaleFeatureSize(params.popartCell, scale),
  popartAngle: params.popartAngle,
  popartThreshold: params.popartThreshold,
  popartGrain: params.popartGrain,
  popartSpatter: params.popartSpatter,
  popartInk: params.popartInk,
  popartPaper: params.popartPaper,
  inkwashDetail: params.inkwashDetail,
  inkwashBands: params.inkwashBands,
  inkwashBleed: params.inkwashBleed,
  inkwashInk: params.inkwashInk,
  inkwashPaper: params.inkwashPaper,
  mangaCell: scaleFeatureSize(params.mangaCell, scale),
  mangaAngle: params.mangaAngle,
  mangaLineWeight: params.mangaLineWeight,
  mangaContrast: params.mangaContrast,
});

const seedFields = (params: ProcessParams): Partial<TransformContext> => ({
  frameSeed: params.frameSeed,
  boilSeed: params.boilSeed,
  halftoneFrameSeed: params.halftoneFrameSeed,
  popartFrameSeed: params.popartFrameSeed,
  style: params.style,
});

export const buildTransformContext = (params: ProcessParams, geometry: ContextGeometry): TransformContext => ({
  ...toneFields(params),
  ...charFields(params),
  ...lookFields(params, geometry.exportScale),
  ...seedFields(params),
  data: geometry.pixels,
  width: geometry.sampleWidth,
  height: geometry.sampleHeight,
  asciiGridCols: geometry.cols,
  asciiGridRows: geometry.rows,
  contrast: params.contrast,
  brightness: params.brightness,
  saturation: params.saturation,
  isColor: params.isColor,
  masks: params.masks,
  brushAlphas: resolveBrushAlphas(params.masks, geometry.sampleWidth, geometry.sampleHeight),
  overlayMaskId: params.overlayMaskId,
  inkShiftScale: geometry.sampleWidth / geometry.sourceWidth,
  styleScale: styleScaleFor(geometry.sampleWidth, geometry.sampleHeight),
});
