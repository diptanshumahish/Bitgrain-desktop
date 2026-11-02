import type { TransformMode } from "@bitgrain/engine/core/types";
import type { PresetConfig } from "../popovers/PresetsPopover";
import { isFilterMode } from "../filter-modes";
import type { HazeValues, LookValues, ToneValues } from "./use-toolbar-values";

export interface EffectsData {
  modes: string[];
  lutId: string | null;
  ditherMethod: string;
  ditherFactor: number;
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  grain: number;
  hue: number;
  isColor: boolean;
  palette: { id: string; colors: string[] } | null;
  hazeIntensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
  hazeWarmth: string;
}

export interface ActiveFlags {
  hasActiveFilters: boolean;
  hasActiveHazeBloom: boolean;
  isHalftoneActive: boolean;
  isPopartActive: boolean;
  isAsciiActive: boolean;
  isBrailleActive: boolean;
  isContourActive: boolean;
  isInkwashActive: boolean;
  isMangaActive: boolean;
  isGrainActive: boolean;
}

export const activeFlagsFor = (mode: TransformMode[]): ActiveFlags => ({
  hasActiveFilters: mode.some(isFilterMode),
  hasActiveHazeBloom: mode.includes("haze-bloom"),
  isHalftoneActive: mode.includes("halftone"),
  isPopartActive: mode.includes("popart"),
  isAsciiActive: mode.includes("ascii"),
  isBrailleActive: mode.includes("braille"),
  isContourActive: mode.includes("contour"),
  isInkwashActive: mode.includes("inkwash"),
  isMangaActive: mode.includes("manga"),
  isGrainActive: mode.includes("grain"),
});

export const currentConfigFor = (look: LookValues, tone: ToneValues): PresetConfig => ({
  modes: look.mode, ditherMethod: look.ditherMethod, ditherFactor: look.ditherFactor, palette: look.palette,
  resolution: tone.resolution, contrast: tone.contrast, brightness: tone.brightness, saturation: tone.saturation,
  grain: tone.grain, hue: tone.hue, isColor: look.isColor,
});

const rgbText = (colour: readonly number[]): string => `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;

export const effectsDataFor = (look: LookValues, tone: ToneValues, haze: HazeValues): EffectsData => ({
  modes: look.mode as unknown as string[],
  lutId: look.lutId,
  ditherMethod: look.ditherMethod as unknown as string,
  ditherFactor: look.ditherFactor,
  resolution: tone.resolution,
  contrast: tone.contrast,
  brightness: tone.brightness,
  saturation: tone.saturation,
  grain: tone.grain,
  hue: tone.hue,
  isColor: look.isColor,
  palette: look.palette ? { id: look.palette.id, colors: look.palette.colors.map(rgbText) } : null,
  ...haze,
  hazeWarmth: haze.hazeWarmth as unknown as string,
});
