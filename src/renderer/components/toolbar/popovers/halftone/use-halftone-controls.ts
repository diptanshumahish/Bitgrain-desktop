import { useSignalValue } from "../../../../lib/signal";
import { imageMetaSignal } from "../../../../store/image-store";
import {
  contrastSignal,
  halftoneAngleSignal,
  halftoneIntensitySignal,
  halftoneInvertSignal,
  halftoneLinesSignal,
  halftoneShapeSignal,
  halftoneSharpnessSignal,
  halftoneGritSignal,
  halftoneStyleSignal,
} from "../../../../store/transform-store";
import type { HalftoneShape, HalftoneStyle } from "../../../../engine/plugins/halftone/halftone-defaults";

export interface HalftoneControls {
  lines: number;
  style: HalftoneStyle;
  contrast: number;
  angle: number;
  shape: HalftoneShape;
  sharpness: number;
  grit: number;
  intensity: number;
  invert: boolean;
  imageLongEdge: number | null;
}

const longEdgeOf = (meta: { width: number; height: number } | null): number | null =>
  meta ? Math.max(meta.width, meta.height) : null;

export const useHalftoneControls = (): HalftoneControls => ({
  lines: useSignalValue(halftoneLinesSignal),
  style: useSignalValue(halftoneStyleSignal),
  contrast: useSignalValue(contrastSignal),
  angle: useSignalValue(halftoneAngleSignal),
  shape: useSignalValue(halftoneShapeSignal),
  sharpness: useSignalValue(halftoneSharpnessSignal),
  grit: useSignalValue(halftoneGritSignal),
  intensity: useSignalValue(halftoneIntensitySignal),
  invert: useSignalValue(halftoneInvertSignal),
  imageLongEdge: longEdgeOf(useSignalValue(imageMetaSignal)),
});
