import type { BezierCurve, EasingId } from "@bitgrain/studio-core/model/animation-types";
import { curveForEasing } from "@bitgrain/studio-core/animate/tracks/easing";

export interface EasingValue {
  easing: EasingId;
  bezier?: BezierCurve;
}

interface EasingPreset {
  id: string;
  label: string;
  value: EasingValue;
}

const CUSTOM_BASE: EasingId = "ease-in-out";

const curvePreset = (id: string, label: string, bezier: BezierCurve): EasingPreset => ({
  id,
  label,
  value: { easing: CUSTOM_BASE, bezier },
});

export const EASING_PRESETS: readonly EasingPreset[] = [
  { id: "linear", label: "Linear", value: { easing: "linear" } },
  { id: "ease-in", label: "Ease in", value: { easing: "ease-in" } },
  { id: "ease-out", label: "Ease out", value: { easing: "ease-out" } },
  { id: "ease-in-out", label: "Ease in out", value: { easing: "ease-in-out" } },
  { id: "spring", label: "Spring", value: { easing: "spring" } },
  { id: "hold", label: "Hold", value: { easing: "hold" } },
  curvePreset("sine-in-out", "Sine in out", [0.37, 0, 0.63, 1]),
  curvePreset("cubic-in", "Cubic in", [0.32, 0, 0.67, 0]),
  curvePreset("cubic-out", "Cubic out", [0.33, 1, 0.68, 1]),
  curvePreset("cubic-in-out", "Cubic in out", [0.65, 0, 0.35, 1]),
  curvePreset("expo-in", "Expo in", [0.7, 0, 0.84, 0]),
  curvePreset("expo-out", "Expo out", [0.16, 1, 0.3, 1]),
  curvePreset("expo-in-out", "Expo in out", [0.87, 0, 0.13, 1]),
  curvePreset("back-in", "Back in", [0.36, 0, 0.66, -0.56]),
  curvePreset("back-out", "Back out", [0.34, 1.56, 0.64, 1]),
  curvePreset("back-in-out", "Back in out", [0.68, -0.6, 0.32, 1.6]),
];

const sameCurve = (first: BezierCurve | undefined, second: BezierCurve | undefined): boolean =>
  !!first && !!second && first.every((value, index) => value === second[index]);

export const matchPreset = (value: EasingValue): EasingPreset | undefined =>
  EASING_PRESETS.find((preset) =>
    value.bezier
      ? sameCurve(preset.value.bezier, value.bezier)
      : !preset.value.bezier && preset.value.easing === value.easing,
  );

export const easingLabel = (value: EasingValue): string => matchPreset(value)?.label ?? "Custom curve";

export const displayCurve = (value: EasingValue): BezierCurve | null => curveForEasing(value.easing, value.bezier);

export const customValue = (bezier: BezierCurve): EasingValue => ({ easing: CUSTOM_BASE, bezier });
