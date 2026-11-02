import type { NumberParamSpec, ParamSpec, SelectOption } from "../../../engine/style-types";

interface NumberOptions {
  key: string;
  label: string;
  min: number;
  max: number;
  value: number;
  step?: number;
  suffix?: string;
  advanced?: boolean;
  pixels?: boolean;
  hint?: string;
}

export const numberSpec = (options: NumberOptions): NumberParamSpec => ({
  kind: "number", key: options.key, label: options.label, min: options.min, max: options.max,
  step: options.step ?? 1, default: options.value, suffix: options.suffix, advanced: options.advanced,
  scalesWithExport: options.pixels, hint: options.hint,
});

export const selectSpec = (key: string, label: string, options: readonly SelectOption[], value: string, advanced = false): ParamSpec => ({
  kind: "select", key, label, options, default: value, advanced,
});

export const colourSpec = (key: string, label: string, value: string, advanced = false): ParamSpec => ({
  kind: "colour", key, label, default: value, advanced,
});

export const option = (value: string, label: string): SelectOption => ({ value, label });
