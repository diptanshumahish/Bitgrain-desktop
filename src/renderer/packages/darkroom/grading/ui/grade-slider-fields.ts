import type { GradeSliderKey } from "@bitgrain/engine/grading/engine/grade-types";

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
  { key: "exposure", label: "Exposure", min: -2, max: 2, step: 0.05, decimals: 2 },
  { key: "highlights", label: "Highlights", ...SIGNED_PERCENT },
  { key: "shadows", label: "Shadows", ...SIGNED_PERCENT },
  { key: "whites", label: "Whites", ...SIGNED_PERCENT },
  { key: "blacks", label: "Blacks", ...SIGNED_PERCENT },
];

export const COLOR_FIELDS: readonly GradeSliderField[] = [
  { key: "temperature", label: "Temperature", ...SIGNED_PERCENT },
  { key: "tint", label: "Tint", ...SIGNED_PERCENT },
  { key: "vibrance", label: "Vibrance", ...SIGNED_PERCENT },
];

export const BALANCE_FIELD: GradeSliderField = { key: "balance", label: "Balance", ...SIGNED_PERCENT };
