export type TransformMode =
  | 'ascii' | 'braille' | 'contour' | 'dither' | 'blocky' | 'grunge'
  | 'invert' | 'grayscale' | 'pixelate'
  | 'grain' | 'dot-matrix' | 'lut' | 'haze-bloom'
  | 'halftone' | 'scanlines' | 'crosshatch'
  | 'popart' | 'photocopy' | 'misprint' | 'fold' | 'dust'
  | 'colorgrade' | 'duotone' | 'vignette' | 'posterize' | 'sharpen' | 'colorwash'
  | 'inkwash' | 'manga';

export type DitherMethod = 
  | 'threshold' | 'floyd-steinberg' | 'atkinson' | 'random'
  | 'sierra' | 'sierra-2' | 'sierra-lite' 
  | 'stucki' | 'burkes' | 'jjn'
  | 'bayer-2' | 'bayer-4' | 'bayer-8'
  | 'blue-noise';

export interface Palette {
  id: string;
  name: string;
  colors: [number, number, number][]; // Array of [R, G, B]
}

export type AsciiTone = "dark" | "light";

export interface TransformContext {
  data: Float32Array;
  width: number;
  height: number;
  contrast: number;
  brightness: number;
  saturation: number;
  isColor: boolean;
  asciiCharset?: string;
  asciiEdges?: boolean;
  asciiEdgeThreshold?: number;
  contourLevels?: number;
  contourFill?: boolean;
  ditherMethod?: DitherMethod;
  ditherFactor?: number;
  noise?: number;
  hue?: number;
  palette?: Palette;
  lutId?: string;
  hazeIntensity?: number;
  bloomIntensity?: number;
  bloomThreshold?: number;
  hazeWarmth?: number;
  // Halftone-specific
  halftoneCell?: number;
  halftoneAngle?: number;
  halftoneStyle?: 'mono' | 'color' | 'cmyk';
  halftoneShape?: 'round' | 'square';
  halftoneInvert?: boolean;
  halftoneScale?: number;
  halftoneIntensity?: number;
  halftoneSharpness?: number;
  voronoiCell?: number;
  voronoiJitter?: number;
  voronoiEdge?: number;
  scanlineSpacing?: number;
  scanlineIntensity?: number;
  scanlineRgbShift?: number;
  scanlineCurvature?: number;
  chromaticIntensity?: number;
  chromaticFalloff?: number;
  crosshatchSpacing?: number;
  crosshatchThickness?: number;
  crosshatchInk?: [number, number, number];
  crosshatchPaper?: [number, number, number];
  popartCell?: number;
  popartAngle?: number;
  popartThreshold?: number;
  popartGrain?: number;
  popartSpatter?: number;
  popartInk?: [number, number, number];
  popartPaper?: [number, number, number];
  gradeTemperature?: number;
  gradeTint?: number;
  gradeVibrance?: number;
  duotoneShadow?: [number, number, number];
  duotoneHighlight?: [number, number, number];
  duotoneAmount?: number;
  vignetteAmount?: number;
  vignetteRadius?: number;
  vignetteSoftness?: number;
  posterizeLevels?: number;
  sharpenAmount?: number;
  washColor?: [number, number, number];
  washIntensity?: number;
  washMode?: 'screen' | 'overlay' | 'multiply';
  hazeTint?: [number, number, number];
  photocopyContrast?: number;
  photocopyThreshold?: number;
  misprintAmount?: number;
  misprintAngle?: number;
  foldCount?: number;
  foldIntensity?: number;
  dustAmount?: number;
  dustScratches?: number;
  dustSeed?: number;
  frameSeed?: number;
  popartFrameSeed?: number;
  halftoneFrameSeed?: number;
  // Ink wash
  inkwashDetail?: number;
  inkwashBands?: number;
  inkwashBleed?: number;
  inkwashInk?: [number, number, number];
  inkwashPaper?: [number, number, number];
  // Manga screentone
  mangaCell?: number;
  mangaAngle?: number;
  mangaLineWeight?: number;
  mangaContrast?: number;
}

export interface TransformationResult {
  text?: string;
  charData?: string[];
  colorData?: Uint8ClampedArray;
  workingData?: Float32Array;
  gridWidth?: number;
  gridHeight?: number;
}

export interface ImagePlugin {
  id: TransformMode;
  name: string;
  category: 'Textures' | 'Filters' | 'Creative';
  transform: (ctx: TransformContext) => TransformationResult;
}
