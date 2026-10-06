import { signal } from "../lib/signal";
import type { TransformMode, DitherMethod, Palette, AsciiTone } from "../engine/types";
import { ASCII_DETAILED } from "../engine/plugins/ascii";

export const RESOLUTION_MIN = 0.1;
export const RESOLUTION_MAX = 2;

export const clampResolution = (value: number): number =>
  Math.min(RESOLUTION_MAX, Math.max(RESOLUTION_MIN, value));

export const modesSignal = signal<TransformMode[]>(["halftone"]);
export const ditherMethodSignal = signal<DitherMethod>("atkinson");
export const isColorSignal = signal(true);
export const asciiCharsetSignal = signal<string>(ASCII_DETAILED);
export const asciiToneSignal = signal<AsciiTone>("dark");
export const asciiDensitySignal = signal(1);
export const asciiEdgesSignal = signal(false);
export const asciiEdgeThresholdSignal = signal(0.5);
export const contourLevelsSignal = signal(8);
export const contourFillSignal = signal(false);
export const ditherFactorSignal = signal(1.0);
export const resolutionSignal = signal(2.0);
export const contrastSignal = signal(1.2);
export const brightnessSignal = signal(1.05);
export const saturationSignal = signal(1.15);
export const grainSignal = signal(0.04);
export const hueSignal = signal(0);
export const printFinishSignal = signal(true);
export const printFinishStrengthSignal = signal(0.85);
export const paletteSignal = signal<Palette | null>(null);
export const lutIdSignal = signal<string | null>(null);
export const hazeIntensitySignal  = signal(0.3);
export const bloomIntensitySignal = signal(0.4);
export const bloomThresholdSignal = signal(0.7);
export const hazeWarmthSignal     = signal(0.5);

// ── Halftone ──
export const halftoneCellSignal      = signal(2);
export const halftoneAngleSignal     = signal(15);
export const halftoneStyleSignal     = signal<'mono' | 'color' | 'cmyk'>('color');
export const halftoneShapeSignal     = signal<'round' | 'square'>('round');
export const halftoneInvertSignal    = signal(false);
export const halftoneIntensitySignal = signal(1);
export const halftoneSharpnessSignal = signal(60);

export type RGB = [number, number, number];

// ── Ink Wash ──
export const inkwashDetailSignal = signal(16);
export const inkwashBandsSignal  = signal(5);
export const inkwashBleedSignal  = signal(0.35);
export const inkwashInkSignal    = signal<RGB>([30, 28, 26]);
export const inkwashPaperSignal  = signal<RGB>([250, 247, 238]);

// ── Manga ──
export const mangaCellSignal       = signal(2);
export const mangaAngleSignal      = signal(45);
export const mangaLineWeightSignal = signal(0.6);
export const mangaContrastSignal   = signal(0.5);

// ── Pop Grunge ──
export const popartCellSignal      = signal(2);
export const popartAngleSignal     = signal(30);
export const popartThresholdSignal = signal(0.55);
export const popartGrainSignal     = signal(0.35);
export const popartSpatterSignal   = signal(0.45);
export const popartInkSignal       = signal<RGB>([220, 38, 38]);
export const popartPaperSignal     = signal<RGB>([10, 10, 10]);

export interface TransformSnapshot {
  modes: TransformMode[];
  ditherMethod: DitherMethod;
  isColor: boolean;
  asciiCharset: string;
  asciiTone: AsciiTone;
  asciiDensity: number;
  asciiEdges: boolean;
  asciiEdgeThreshold: number;
  contourLevels: number;
  contourFill: boolean;
  ditherFactor: number;
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  grain: number;
  hue: number;
  printFinish: boolean;
  printFinishStrength: number;
  palette: Palette | null;
  lutId: string | null;
  hazeIntensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
  hazeWarmth: number;
  // Halftone
  halftoneCell: number;
  halftoneAngle: number;
  halftoneStyle: 'mono' | 'color' | 'cmyk';
  halftoneShape: 'round' | 'square';
  halftoneInvert: boolean;
  halftoneIntensity: number;
  halftoneSharpness: number;
  // Ink Wash
  inkwashDetail: number;
  inkwashBands: number;
  inkwashBleed: number;
  inkwashInk: RGB;
  inkwashPaper: RGB;
  // Manga
  mangaCell: number;
  mangaAngle: number;
  mangaLineWeight: number;
  mangaContrast: number;
  // Pop Grunge
  popartCell: number;
  popartAngle: number;
  popartThreshold: number;
  popartGrain: number;
  popartSpatter: number;
  popartInk: RGB;
  popartPaper: RGB;
}

export function captureSnapshot(): TransformSnapshot {
  return {
    modes: modesSignal.value,
    ditherMethod: ditherMethodSignal.value,
    isColor: isColorSignal.value,
    asciiCharset: asciiCharsetSignal.value,
    asciiTone: asciiToneSignal.value,
    asciiDensity: asciiDensitySignal.value,
    asciiEdges: asciiEdgesSignal.value,
    asciiEdgeThreshold: asciiEdgeThresholdSignal.value,
    contourLevels: contourLevelsSignal.value,
    contourFill: contourFillSignal.value,
    ditherFactor: ditherFactorSignal.value,
    resolution: resolutionSignal.value,
    contrast: contrastSignal.value,
    brightness: brightnessSignal.value,
    saturation: saturationSignal.value,
    grain: grainSignal.value,
    hue: hueSignal.value,
    printFinish: printFinishSignal.value,
    printFinishStrength: printFinishStrengthSignal.value,
    palette: paletteSignal.value,
    lutId: lutIdSignal.value,
    hazeIntensity: hazeIntensitySignal.value,
    bloomIntensity: bloomIntensitySignal.value,
    bloomThreshold: bloomThresholdSignal.value,
    hazeWarmth: hazeWarmthSignal.value,
    halftoneCell: halftoneCellSignal.value,
    halftoneAngle: halftoneAngleSignal.value,
    halftoneStyle: halftoneStyleSignal.value,
    halftoneShape: halftoneShapeSignal.value,
    halftoneInvert: halftoneInvertSignal.value,
    halftoneIntensity: halftoneIntensitySignal.value,
    halftoneSharpness: halftoneSharpnessSignal.value,
    inkwashDetail: inkwashDetailSignal.value,
    inkwashBands: inkwashBandsSignal.value,
    inkwashBleed: inkwashBleedSignal.value,
    inkwashInk: inkwashInkSignal.value,
    inkwashPaper: inkwashPaperSignal.value,
    mangaCell: mangaCellSignal.value,
    mangaAngle: mangaAngleSignal.value,
    mangaLineWeight: mangaLineWeightSignal.value,
    mangaContrast: mangaContrastSignal.value,
    popartCell: popartCellSignal.value,
    popartAngle: popartAngleSignal.value,
    popartThreshold: popartThresholdSignal.value,
    popartGrain: popartGrainSignal.value,
    popartSpatter: popartSpatterSignal.value,
    popartInk: popartInkSignal.value,
    popartPaper: popartPaperSignal.value,
  };
}

export function applySnapshot(snapshot: TransformSnapshot): void {
  modesSignal.value = snapshot.modes;
  ditherMethodSignal.value = snapshot.ditherMethod;
  isColorSignal.value = snapshot.isColor;
  if (snapshot.asciiCharset !== undefined) asciiCharsetSignal.value = snapshot.asciiCharset;
  if (snapshot.asciiTone !== undefined) asciiToneSignal.value = snapshot.asciiTone;
  if (snapshot.asciiDensity !== undefined) asciiDensitySignal.value = snapshot.asciiDensity;
  if (snapshot.asciiEdges !== undefined) asciiEdgesSignal.value = snapshot.asciiEdges;
  if (snapshot.asciiEdgeThreshold !== undefined) asciiEdgeThresholdSignal.value = snapshot.asciiEdgeThreshold;
  if (snapshot.contourLevels !== undefined) contourLevelsSignal.value = snapshot.contourLevels;
  if (snapshot.contourFill !== undefined) contourFillSignal.value = snapshot.contourFill;
  ditherFactorSignal.value = snapshot.ditherFactor;
  resolutionSignal.value = clampResolution(snapshot.resolution);
  contrastSignal.value = snapshot.contrast;
  brightnessSignal.value = snapshot.brightness;
  saturationSignal.value = snapshot.saturation;
  grainSignal.value = snapshot.grain;
  hueSignal.value = snapshot.hue;
  if (snapshot.printFinish !== undefined) printFinishSignal.value = snapshot.printFinish;
  if (snapshot.printFinishStrength !== undefined) printFinishStrengthSignal.value = snapshot.printFinishStrength;
  paletteSignal.value = snapshot.palette;
  lutIdSignal.value = snapshot.lutId;
  hazeIntensitySignal.value  = snapshot.hazeIntensity;
  bloomIntensitySignal.value = snapshot.bloomIntensity;
  bloomThresholdSignal.value = snapshot.bloomThreshold;
  hazeWarmthSignal.value     = snapshot.hazeWarmth;
  if (snapshot.halftoneCell  !== undefined) halftoneCellSignal.value   = snapshot.halftoneCell;
  if (snapshot.halftoneAngle !== undefined) halftoneAngleSignal.value  = snapshot.halftoneAngle;
  if (snapshot.halftoneStyle !== undefined) halftoneStyleSignal.value  = snapshot.halftoneStyle;
  if (snapshot.halftoneShape !== undefined) halftoneShapeSignal.value  = snapshot.halftoneShape;
  if (snapshot.halftoneInvert !== undefined) halftoneInvertSignal.value = snapshot.halftoneInvert;
  if (snapshot.halftoneIntensity !== undefined) halftoneIntensitySignal.value = snapshot.halftoneIntensity;
  if (snapshot.halftoneSharpness !== undefined) halftoneSharpnessSignal.value = snapshot.halftoneSharpness;
  if (snapshot.inkwashDetail   !== undefined) inkwashDetailSignal.value   = snapshot.inkwashDetail;
  if (snapshot.inkwashBands    !== undefined) inkwashBandsSignal.value    = snapshot.inkwashBands;
  if (snapshot.inkwashBleed    !== undefined) inkwashBleedSignal.value    = snapshot.inkwashBleed;
  if (snapshot.inkwashInk      !== undefined) inkwashInkSignal.value      = snapshot.inkwashInk;
  if (snapshot.inkwashPaper    !== undefined) inkwashPaperSignal.value    = snapshot.inkwashPaper;
  if (snapshot.mangaCell       !== undefined) mangaCellSignal.value       = snapshot.mangaCell;
  if (snapshot.mangaAngle      !== undefined) mangaAngleSignal.value      = snapshot.mangaAngle;
  if (snapshot.mangaLineWeight !== undefined) mangaLineWeightSignal.value = snapshot.mangaLineWeight;
  if (snapshot.mangaContrast   !== undefined) mangaContrastSignal.value   = snapshot.mangaContrast;
  if (snapshot.popartCell      !== undefined) popartCellSignal.value      = snapshot.popartCell;
  if (snapshot.popartAngle     !== undefined) popartAngleSignal.value     = snapshot.popartAngle;
  if (snapshot.popartThreshold !== undefined) popartThresholdSignal.value = snapshot.popartThreshold;
  if (snapshot.popartGrain     !== undefined) popartGrainSignal.value     = snapshot.popartGrain;
  if (snapshot.popartSpatter   !== undefined) popartSpatterSignal.value   = snapshot.popartSpatter;
  if (snapshot.popartInk       !== undefined) popartInkSignal.value       = snapshot.popartInk;
  if (snapshot.popartPaper     !== undefined) popartPaperSignal.value     = snapshot.popartPaper;
}

export function resetTransform(): void {
  modesSignal.value = ["halftone"];
  ditherMethodSignal.value = "atkinson";
  isColorSignal.value = true;
  asciiCharsetSignal.value = ASCII_DETAILED;
  asciiToneSignal.value = "dark";
  asciiDensitySignal.value = 1;
  asciiEdgesSignal.value = false;
  asciiEdgeThresholdSignal.value = 0.5;
  contourLevelsSignal.value = 8;
  contourFillSignal.value = false;
  ditherFactorSignal.value = 1.0;
  resolutionSignal.value = 2.0;
  contrastSignal.value = 1.2;
  brightnessSignal.value = 1.05;
  saturationSignal.value = 1.15;
  grainSignal.value = 0.04;
  hueSignal.value = 0;
  printFinishSignal.value = true;
  printFinishStrengthSignal.value = 0.85;
  paletteSignal.value = null;
  lutIdSignal.value = null;
  hazeIntensitySignal.value  = 0.3;
  bloomIntensitySignal.value = 0.4;
  bloomThresholdSignal.value = 0.7;
  hazeWarmthSignal.value     = 0.5;
  halftoneCellSignal.value   = 2;
  halftoneAngleSignal.value  = 15;
  halftoneStyleSignal.value  = 'color';
  halftoneShapeSignal.value  = 'round';
  halftoneInvertSignal.value = false;
  halftoneIntensitySignal.value = 1;
  halftoneSharpnessSignal.value = 60;
  inkwashDetailSignal.value = 16;
  inkwashBandsSignal.value  = 5;
  inkwashBleedSignal.value  = 0.35;
  inkwashInkSignal.value    = [30, 28, 26];
  inkwashPaperSignal.value  = [250, 247, 238];
  mangaCellSignal.value       = 2;
  mangaAngleSignal.value      = 45;
  mangaLineWeightSignal.value = 0.6;
  mangaContrastSignal.value   = 0.5;
  popartCellSignal.value      = 2;
  popartAngleSignal.value     = 30;
  popartThresholdSignal.value = 0.55;
  popartGrainSignal.value     = 0.35;
  popartSpatterSignal.value   = 0.45;
  popartInkSignal.value       = [220, 38, 38];
  popartPaperSignal.value     = [10, 10, 10];
}
