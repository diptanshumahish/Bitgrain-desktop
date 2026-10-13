import type { HalftoneShape } from "../../engine/plugins/halftone/halftone-defaults";
import type { TransformMode, DitherMethod, Palette, AsciiTone } from "../../engine/types";

export interface WorkerResult {
  type?: string;
  id?: string;
  colorData: Uint8ClampedArray | null;
  charData: string[] | null;
  ditherMask: Uint8Array | null;
  cols: number;
  rows: number;
  charWidth: number;
  charHeight: number;
  isDither: boolean;
  baseData?: Uint8ClampedArray | null;
  effectAlpha?: Uint8ClampedArray | null;
  overlayAlpha?: Uint8ClampedArray | null;
  baseCols?: number;
  baseRows?: number;
}

export interface CompactCacheEntry {
  data: Uint8ClampedArray;
  w: number;
  h: number;
}

export interface OutputPreviewProps {
  image: string;
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  mode: TransformMode | TransformMode[];
  ditherMethod?: DitherMethod;
  ditherFactor?: number;
  isColor: boolean;
  asciiCharset?: string;
  asciiTone?: AsciiTone;
  asciiDensity?: number;
  asciiEdges?: boolean;
  asciiEdgeThreshold?: number;
  contourLevels?: number;
  contourFill?: boolean;
  noise?: number;
  hue?: number;
  printFinish?: boolean;
  printFinishStrength?: number;
  palette?: Palette;
  lutId?: string;
  fgColor: string;
  bgColor: string;
  paperColor?: string | null;
  onResult?: (result: import("../../engine/types").TransformationResult) => void;
  onRender?: (dataUrl: string) => void;
  compareMode?: boolean;
  transparentBg?: boolean;
  compact?: boolean;
  hazeIntensity?: number;
  bloomIntensity?: number;
  bloomThreshold?: number;
  hazeWarmth?: number;
  halftoneCell?: number;
  halftoneLines?: number;
  halftoneAngle?: number;
  halftoneStyle?: 'mono' | 'color' | 'cmyk';
  halftoneShape?: HalftoneShape;
  halftoneInvert?: boolean;
  halftoneIntensity?: number;
  halftoneSharpness?: number;
  halftoneGrit?: number;
  popartCell?: number;
  popartAngle?: number;
  popartThreshold?: number;
  popartGrain?: number;
  popartSpatter?: number;
  popartInk?: [number, number, number];
  popartPaper?: [number, number, number];
  inkwashDetail?: number;
  inkwashBands?: number;
  inkwashBleed?: number;
  inkwashInk?: [number, number, number];
  inkwashPaper?: [number, number, number];
  mangaCell?: number;
  mangaAngle?: number;
  mangaLineWeight?: number;
  mangaContrast?: number;
  grade?: import("../../modules/grading/engine/grade-types").ColorGrade;
  masks?: import("../../modules/grading/mask/mask-types").MaskLayer[];
  overlayMaskId?: string | null;
}
