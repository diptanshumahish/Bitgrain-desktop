import type { TransformSnapshot } from "../../store/transform-store";
import type { PresetConfig } from "./types";
import { linesFromSnapshot } from "../plugins/halftone/halftone-legacy";
import { HALFTONE_DEFAULTS } from "../plugins/halftone/halftone-defaults";

const halftoneFinishDefaults = {
  halftoneShape: HALFTONE_DEFAULTS.shape,
  halftoneSharpness: HALFTONE_DEFAULTS.sharpness,
  halftoneIntensity: HALFTONE_DEFAULTS.intensity,
};

const hasHalftoneSize = (config: PresetConfig): boolean =>
  config.halftoneLines !== undefined || config.halftoneCell !== undefined;

export function presetToSnapshot(base: TransformSnapshot, config: PresetConfig): TransformSnapshot {
  return {
    ...base,
    modes: config.modes,
    ditherMethod: config.ditherMethod,
    ditherFactor: config.ditherFactor,
    palette: config.palette,
    resolution: config.resolution,
    contrast: config.contrast,
    brightness: config.brightness,
    saturation: config.saturation,
    grain: config.grain,
    hue: config.hue,
    isColor: config.isColor,
    lutId: null,
    halftoneCell: config.halftoneCell ?? base.halftoneCell,
    halftoneLines: hasHalftoneSize(config) ? linesFromSnapshot(config) : base.halftoneLines,
    halftoneAngle: config.halftoneAngle ?? base.halftoneAngle,
    halftoneStyle: config.halftoneStyle ?? base.halftoneStyle,
    halftoneInvert: config.halftoneInvert ?? base.halftoneInvert,
    ...(config.modes.includes("halftone") ? halftoneFinishDefaults : {}),
    halftoneGrit: config.halftoneGrit ?? HALFTONE_DEFAULTS.grit,
    asciiCharset: config.asciiCharset ?? base.asciiCharset,
    asciiTone: config.asciiTone ?? base.asciiTone,
    asciiDensity: config.asciiDensity ?? base.asciiDensity,
    asciiEdges: config.asciiEdges ?? base.asciiEdges,
    asciiEdgeThreshold: config.asciiEdgeThreshold ?? base.asciiEdgeThreshold,
    contourLevels: config.contourLevels ?? base.contourLevels,
    contourFill: config.contourFill ?? base.contourFill,
  };
}
