import { useSignalValue } from "../../../lib/signal";
import {
  asciiCharsetSignal,
  asciiToneSignal,
  asciiDensitySignal,
  asciiEdgesSignal,
  asciiEdgeThresholdSignal,
  contourLevelsSignal,
  contourFillSignal,
  hazeIntensitySignal,
  bloomIntensitySignal,
  bloomThresholdSignal,
  hazeWarmthSignal,
  halftoneCellSignal,
  halftoneLinesSignal,
  halftoneAngleSignal,
  halftoneStyleSignal,
  halftoneShapeSignal,
  halftoneInvertSignal,
  halftoneIntensitySignal,
  halftoneSharpnessSignal,
  halftoneGritSignal,
} from "../../../store/transform-store";
import type { OutputPreviewProps } from "../../../components/output-preview/types";

type TextAndHalftoneProps = Pick<
  OutputPreviewProps,
  | "asciiCharset" | "asciiTone" | "asciiDensity" | "asciiEdges" | "asciiEdgeThreshold"
  | "contourLevels" | "contourFill"
  | "hazeIntensity" | "bloomIntensity" | "bloomThreshold" | "hazeWarmth"
  | "halftoneCell" | "halftoneLines" | "halftoneAngle" | "halftoneStyle" | "halftoneShape"
  | "halftoneInvert" | "halftoneIntensity" | "halftoneSharpness" | "halftoneGrit"
>;

export const useTextAndHalftoneProps = (): TextAndHalftoneProps => ({
  asciiCharset: useSignalValue(asciiCharsetSignal),
  asciiTone: useSignalValue(asciiToneSignal),
  asciiDensity: useSignalValue(asciiDensitySignal),
  asciiEdges: useSignalValue(asciiEdgesSignal),
  asciiEdgeThreshold: useSignalValue(asciiEdgeThresholdSignal),
  contourLevels: useSignalValue(contourLevelsSignal),
  contourFill: useSignalValue(contourFillSignal),
  hazeIntensity: useSignalValue(hazeIntensitySignal),
  bloomIntensity: useSignalValue(bloomIntensitySignal),
  bloomThreshold: useSignalValue(bloomThresholdSignal),
  hazeWarmth: useSignalValue(hazeWarmthSignal),
  halftoneCell: useSignalValue(halftoneCellSignal),
  halftoneLines: useSignalValue(halftoneLinesSignal),
  halftoneAngle: useSignalValue(halftoneAngleSignal),
  halftoneStyle: useSignalValue(halftoneStyleSignal),
  halftoneShape: useSignalValue(halftoneShapeSignal),
  halftoneInvert: useSignalValue(halftoneInvertSignal),
  halftoneIntensity: useSignalValue(halftoneIntensitySignal),
  halftoneSharpness: useSignalValue(halftoneSharpnessSignal),
  halftoneGrit: useSignalValue(halftoneGritSignal),
});
