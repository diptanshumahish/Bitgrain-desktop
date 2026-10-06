import type { TransformMode, DitherMethod, Palette, AsciiTone } from "../types";

export interface PresetConfig {
  modes: TransformMode[];
  ditherMethod: DitherMethod;
  ditherFactor: number;
  palette: Palette | null;
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  grain: number;
  hue: number;
  isColor: boolean;
  halftoneCell?: number;
  halftoneAngle?: number;
  halftoneStyle?: 'mono' | 'color' | 'cmyk';
  halftoneInvert?: boolean;
  asciiCharset?: string;
  asciiTone?: AsciiTone;
  asciiDensity?: number;
  asciiEdges?: boolean;
  asciiEdgeThreshold?: number;
  contourLevels?: number;
  contourFill?: boolean;
}

export interface Preset {
  name: string;
  tag: string;
  config: PresetConfig;
}
