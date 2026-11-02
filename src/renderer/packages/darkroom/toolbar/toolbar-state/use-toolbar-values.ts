import { useSignalValue } from "@bitgrain/core/signal";
import { modesSignal, ditherMethodSignal, isColorSignal, asciiCharsetSignal, asciiToneSignal, asciiDensitySignal, asciiEdgesSignal, asciiEdgeThresholdSignal, contourLevelsSignal, contourFillSignal, ditherFactorSignal, resolutionSignal, contrastSignal, brightnessSignal, saturationSignal, grainSignal, hueSignal, paletteSignal, lutIdSignal, hazeIntensitySignal, bloomIntensitySignal, bloomThresholdSignal, hazeWarmthSignal, popartCellSignal, popartAngleSignal, popartThresholdSignal, popartGrainSignal, popartSpatterSignal, popartInkSignal, popartPaperSignal, inkwashDetailSignal, inkwashBandsSignal, inkwashBleedSignal, inkwashInkSignal, inkwashPaperSignal, mangaCellSignal, mangaAngleSignal, mangaLineWeightSignal, mangaContrastSignal } from "../../state/transform-store";
import { printFinishSignal, printFinishStrengthSignal } from "@bitgrain/engine/finish/print-finish-state";
import type { RGB } from "@bitgrain/core/color/rgb";
import type { AsciiTone, DitherMethod, Palette, TransformMode } from "@bitgrain/engine/core/types";

export interface LookValues {
  mode: TransformMode[];
  ditherMethod: DitherMethod;
  ditherFactor: number;
  isColor: boolean;
  palette: Palette | null;
  lutId: string | null;
  contourLevels: number;
  contourFill: boolean;
}

export interface ToneValues {
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  grain: number;
  hue: number;
  printFinish: boolean;
  printFinishStrength: number;
}

export interface AsciiValues {
  asciiCharset: string;
  asciiTone: AsciiTone;
  asciiDensity: number;
  asciiEdges: boolean;
  asciiEdgeThreshold: number;
}

export interface HazeValues {
  hazeIntensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
  hazeWarmth: number;
}

export interface PopartValues {
  popartCell: number;
  popartAngle: number;
  popartThreshold: number;
  popartGrain: number;
  popartSpatter: number;
  popartInk: RGB;
  popartPaper: RGB;
}

export interface LineInkValues {
  inkwashDetail: number;
  inkwashBands: number;
  inkwashBleed: number;
  inkwashInk: RGB;
  inkwashPaper: RGB;
  mangaCell: number;
  mangaAngle: number;
  mangaLineWeight: number;
  mangaContrast: number;
}

export const useLookValues = (): LookValues => ({
  mode: useSignalValue(modesSignal),
  ditherMethod: useSignalValue(ditherMethodSignal),
  ditherFactor: useSignalValue(ditherFactorSignal),
  isColor: useSignalValue(isColorSignal),
  palette: useSignalValue(paletteSignal),
  lutId: useSignalValue(lutIdSignal),
  contourLevels: useSignalValue(contourLevelsSignal),
  contourFill: useSignalValue(contourFillSignal),
});

export const useToneValues = (): ToneValues => ({
  resolution: useSignalValue(resolutionSignal),
  contrast: useSignalValue(contrastSignal),
  brightness: useSignalValue(brightnessSignal),
  saturation: useSignalValue(saturationSignal),
  grain: useSignalValue(grainSignal),
  hue: useSignalValue(hueSignal),
  printFinish: useSignalValue(printFinishSignal),
  printFinishStrength: useSignalValue(printFinishStrengthSignal),
});

export const useAsciiValues = (): AsciiValues => ({
  asciiCharset: useSignalValue(asciiCharsetSignal),
  asciiTone: useSignalValue(asciiToneSignal),
  asciiDensity: useSignalValue(asciiDensitySignal),
  asciiEdges: useSignalValue(asciiEdgesSignal),
  asciiEdgeThreshold: useSignalValue(asciiEdgeThresholdSignal),
});

export const useHazeValues = (): HazeValues => ({
  hazeIntensity: useSignalValue(hazeIntensitySignal),
  bloomIntensity: useSignalValue(bloomIntensitySignal),
  bloomThreshold: useSignalValue(bloomThresholdSignal),
  hazeWarmth: useSignalValue(hazeWarmthSignal),
});

export const usePopartValues = (): PopartValues => ({
  popartCell: useSignalValue(popartCellSignal),
  popartAngle: useSignalValue(popartAngleSignal),
  popartThreshold: useSignalValue(popartThresholdSignal),
  popartGrain: useSignalValue(popartGrainSignal),
  popartSpatter: useSignalValue(popartSpatterSignal),
  popartInk: useSignalValue(popartInkSignal),
  popartPaper: useSignalValue(popartPaperSignal),
});

export const useLineInkValues = (): LineInkValues => ({
  inkwashDetail: useSignalValue(inkwashDetailSignal),
  inkwashBands: useSignalValue(inkwashBandsSignal),
  inkwashBleed: useSignalValue(inkwashBleedSignal),
  inkwashInk: useSignalValue(inkwashInkSignal),
  inkwashPaper: useSignalValue(inkwashPaperSignal),
  mangaCell: useSignalValue(mangaCellSignal),
  mangaAngle: useSignalValue(mangaAngleSignal),
  mangaLineWeight: useSignalValue(mangaLineWeightSignal),
  mangaContrast: useSignalValue(mangaContrastSignal),
});
