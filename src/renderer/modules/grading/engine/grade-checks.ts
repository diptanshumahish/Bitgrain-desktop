import type { ColorGrade, CurvePoint, HslAdjustments, ToneCurves, ToneWheels } from "./grade-types";
import { HSL_BANDS } from "./grade-defaults";

const LIGHT_AND_COLOR_KEYS = [
  "exposure",
  "highlights",
  "shadows",
  "whites",
  "blacks",
  "temperature",
  "tint",
  "vibrance",
] as const;

export const isIdentityCurve = (points: readonly CurvePoint[]): boolean =>
  points.every((point) => point.x === point.y);

export const hasActiveCurves = (curves: ToneCurves): boolean =>
  !isIdentityCurve(curves.master) ||
  !isIdentityCurve(curves.red) ||
  !isIdentityCurve(curves.green) ||
  !isIdentityCurve(curves.blue);

export const hasActiveHsl = (hsl: HslAdjustments): boolean =>
  HSL_BANDS.some((band) => {
    const adjustment = hsl[band];
    return adjustment.hue !== 0 || adjustment.saturation !== 0 || adjustment.luminance !== 0;
  });

export const hasActiveWheels = (wheels: ToneWheels): boolean =>
  wheels.shadows.amount !== 0 || wheels.midtones.amount !== 0 || wheels.highlights.amount !== 0;

export const isNeutralGrade = (grade: ColorGrade | null | undefined): boolean => {
  if (!grade) return true;
  const hasLightOrColor = LIGHT_AND_COLOR_KEYS.some((key) => grade[key] !== 0);
  return !hasLightOrColor && !hasActiveCurves(grade.curves) && !hasActiveHsl(grade.hsl) && !hasActiveWheels(grade.wheels);
};
