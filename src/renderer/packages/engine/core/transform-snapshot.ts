import type { RGB } from "@bitgrain/core/color/rgb";
import type { HalftoneShape } from "../plugins/halftone/halftone-defaults";
import type { TransformMode, DitherMethod, Palette, AsciiTone } from "./types";
import type { ColorGrade } from "../grading/engine/grade-types";
import type { StyleSettings } from "../styles/engine/style-types";

export interface SnapshotExtras {
  grade?: ColorGrade;
  style?: StyleSettings;
}

export interface TransformSnapshot extends SnapshotExtras {
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
  paperColor?: string | null;
  lutId: string | null;
  hazeIntensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
  hazeWarmth: number;
  halftoneCell: number;
  halftoneLines?: number;
  halftoneAngle: number;
  halftoneStyle: 'mono' | 'color' | 'cmyk';
  halftoneShape: HalftoneShape;
  halftoneInvert: boolean;
  halftoneIntensity: number;
  halftoneSharpness: number;
  halftoneGrit?: number;
  inkwashDetail: number;
  inkwashBands: number;
  inkwashBleed: number;
  inkwashInk: RGB;
  inkwashPaper: RGB;
  mangaCell: number;
  mangaAngle: number;
  mangaLineWeight: number;
  mangaContrast: number;
  popartCell: number;
  popartAngle: number;
  popartThreshold: number;
  popartGrain: number;
  popartSpatter: number;
  popartInk: RGB;
  popartPaper: RGB;
}
