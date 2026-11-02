import type { BezierCurve, EasingId } from "../../model/animation-types";
import { cubicBezierEase } from "./bezier";

const BACK_C1 = 1.70158;
const BACK_C3 = BACK_C1 + 1;
const HALF = 0.5;

const EASINGS: Record<EasingId, (progress: number) => number> = {
  linear: (progress) => progress,
  "ease-in": (progress) => progress * progress,
  "ease-out": (progress) => 1 - (1 - progress) * (1 - progress),
  "ease-in-out": (progress) =>
    progress < HALF ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2,
  spring: (progress) => 1 + BACK_C3 * Math.pow(progress - 1, 3) + BACK_C1 * Math.pow(progress - 1, 2),
  hold: () => 0,
};

const PRESET_BEZIERS: Record<Exclude<EasingId, "hold">, BezierCurve> = {
  linear: [0, 0, 1, 1],
  "ease-in": [0.11, 0, 0.5, 0],
  "ease-out": [0.5, 1, 0.89, 1],
  "ease-in-out": [0.45, 0, 0.55, 1],
  spring: [0.34, 1.56, 0.64, 1],
};

export const easeProgress = (easing: EasingId, bezier: BezierCurve | undefined, progress: number): number => {
  if (easing === "hold") return 0;
  if (bezier) return cubicBezierEase(bezier, progress);
  return EASINGS[easing](progress);
};

export const curveForEasing = (easing: EasingId, bezier: BezierCurve | undefined): BezierCurve | null => {
  if (easing === "hold") return null;
  return bezier ?? PRESET_BEZIERS[easing];
};

export const curveOvershoots = (curve: BezierCurve): boolean =>
  curve.some((value) => value < 0 || value > 1);
