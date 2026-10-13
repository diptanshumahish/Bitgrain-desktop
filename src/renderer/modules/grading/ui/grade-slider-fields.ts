import type { GradeSliderKey } from "../engine/grade-types";

export interface GradeSliderField {
  key: GradeSliderKey;
  label: string;
  min: number;
  max: number;
  step: number;
  decimals?: number;
}

const SIGNED_PERCENT = { min: -100, max: 100, step: 1 };

export const LIGHT_FIELDS: readonly GradeSliderField[] = [
  { key: "exposure", label: "exposure", min: -2, max: 2, step: 0.05, decimals: 2 },
  { key: "highlights", label: "highlights", ...SIGNED_PERCENT },
  { key: "shadows", label: "shadows", ...SIGNED_PERCENT },
  { key: "whites", label: "whites", ...SIGNED_PERCENT },
  { key: "blacks", label: "blacks", ...SIGNED_PERCENT },
];

export const COLOR_FIELDS: readonly GradeSliderField[] = [
  { key: "temperature", label: "temperature", ...SIGNED_PERCENT },
  { key: "tint", label: "tint", ...SIGNED_PERCENT },
  { key: "vibrance", label: "vibrance", ...SIGNED_PERCENT },
];

export const BALANCE_FIELD: GradeSliderField = { key: "balance", label: "balance", ...SIGNED_PERCENT };
