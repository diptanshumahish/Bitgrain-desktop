import type { WritableSignal } from "@bitgrain/core/signal";
import { modesSignal, asciiCharsetSignal, asciiToneSignal, asciiDensitySignal, asciiEdgesSignal, asciiEdgeThresholdSignal, contourLevelsSignal, contourFillSignal, ditherFactorSignal, resolutionSignal, contrastSignal, brightnessSignal, saturationSignal, grainSignal, hueSignal, hazeIntensitySignal, bloomIntensitySignal, bloomThresholdSignal, hazeWarmthSignal, popartCellSignal, popartAngleSignal, popartThresholdSignal, popartGrainSignal, popartSpatterSignal, popartInkSignal, popartPaperSignal, inkwashDetailSignal, inkwashBandsSignal, inkwashBleedSignal, inkwashInkSignal, inkwashPaperSignal, mangaCellSignal, mangaAngleSignal, mangaLineWeightSignal, mangaContrastSignal } from "../../state/transform-store";
import { printFinishStrengthSignal } from "@bitgrain/engine/finish/print-finish-state";

const writerFor = <T,>(target: WritableSignal<T>): ((value: T) => void) => (value: T): void => {
  target.value = value;
};

export const TONE_SETTERS = {
  setMode: writerFor(modesSignal),
  setDitherFactor: writerFor(ditherFactorSignal),
  setResolution: writerFor(resolutionSignal),
  setContrast: writerFor(contrastSignal),
  setBrightness: writerFor(brightnessSignal),
  setSaturation: writerFor(saturationSignal),
  setGrain: writerFor(grainSignal),
  setHue: writerFor(hueSignal),
  setPrintFinishStrength: writerFor(printFinishStrengthSignal),
  setContourLevels: writerFor(contourLevelsSignal),
  setContourFill: writerFor(contourFillSignal),
  setHazeIntensity: writerFor(hazeIntensitySignal),
  setBloomIntensity: writerFor(bloomIntensitySignal),
  setBloomThreshold: writerFor(bloomThresholdSignal),
  setHazeWarmth: writerFor(hazeWarmthSignal),
};

export const ASCII_SETTERS = {
  setAsciiCharset: writerFor(asciiCharsetSignal),
  setAsciiTone: writerFor(asciiToneSignal),
  setAsciiDensity: writerFor(asciiDensitySignal),
  setAsciiEdges: writerFor(asciiEdgesSignal),
  setAsciiEdgeThreshold: writerFor(asciiEdgeThresholdSignal),
};

export const INK_SETTERS = {
  setPopartCell: writerFor(popartCellSignal),
  setPopartAngle: writerFor(popartAngleSignal),
  setPopartThreshold: writerFor(popartThresholdSignal),
  setPopartGrain: writerFor(popartGrainSignal),
  setPopartSpatter: writerFor(popartSpatterSignal),
  setPopartInk: writerFor(popartInkSignal),
  setPopartPaper: writerFor(popartPaperSignal),
  setInkwashDetail: writerFor(inkwashDetailSignal),
  setInkwashBands: writerFor(inkwashBandsSignal),
  setInkwashBleed: writerFor(inkwashBleedSignal),
  setInkwashInk: writerFor(inkwashInkSignal),
  setInkwashPaper: writerFor(inkwashPaperSignal),
  setMangaCell: writerFor(mangaCellSignal),
  setMangaAngle: writerFor(mangaAngleSignal),
  setMangaLineWeight: writerFor(mangaLineWeightSignal),
  setMangaContrast: writerFor(mangaContrastSignal),
};
