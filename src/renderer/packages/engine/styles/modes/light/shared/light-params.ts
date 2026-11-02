import type { NumberParamSpec, SelectOption } from "../../../engine/style-types";

interface RangeOptions {
  min?: number;
  max?: number;
  advanced?: boolean;
  hint?: string;
  suffix?: string;
}

export const rangeParam = (key: string, label: string, defaultValue: number, options: RangeOptions = {}): NumberParamSpec => ({
  kind: "number",
  key,
  label,
  min: options.min ?? 0,
  max: options.max ?? 100,
  step: 1,
  default: defaultValue,
  suffix: options.suffix,
  advanced: options.advanced,
  hint: options.hint,
});

export const advancedRange = (key: string, label: string, defaultValue: number, options: RangeOptions = {}): NumberParamSpec =>
  rangeParam(key, label, defaultValue, { ...options, advanced: true });

export const optionsOf = (entries: Readonly<Record<string, string>>): readonly SelectOption[] =>
  Object.entries(entries).map(([value, label]) => ({ value, label }));
