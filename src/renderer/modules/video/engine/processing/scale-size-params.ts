import type { EffectParams } from "../../types";

type SizeParamKey =
  | "halftoneCell"
  | "popartCell"
  | "scanlineSpacing"
  | "scanlineRgbShift"
  | "crosshatchSpacing"
  | "crosshatchThickness"
  | "misprintAmount";

const SIZE_PARAM_DEFAULTS: Record<SizeParamKey, number> = {
  halftoneCell: 2,
  popartCell: 2,
  scanlineSpacing: 4,
  scanlineRgbShift: 2,
  crosshatchSpacing: 7,
  crosshatchThickness: 1.4,
  misprintAmount: 4,
};

export function scaleSizeParams(params: EffectParams, factor: number): EffectParams {
  if (factor === 1) return params;
  const scaled: EffectParams = { ...params };
  for (const key of Object.keys(SIZE_PARAM_DEFAULTS) as SizeParamKey[]) {
    scaled[key] = (params[key] ?? SIZE_PARAM_DEFAULTS[key]) * factor;
  }
  return scaled;
}
