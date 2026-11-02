import type { NumberParamSpec, SelectOption } from "../../../engine/style-types";

export const percentSpec = (key: string, label: string, defaultValue: number, hint: string, advanced = false): NumberParamSpec => ({
  kind: "number", key, label, min: 0, max: 100, step: 1, default: defaultValue, suffix: "%", hint, advanced,
});

export const pixelSpec = (key: string, label: string, range: readonly [number, number, number], hint: string, advanced = false): NumberParamSpec => ({
  kind: "number", key, label, min: range[0], max: range[1], step: 1, default: range[2], suffix: "px", hint, advanced, scalesWithExport: true,
});

export const option = (value: string, label: string): SelectOption => ({ value, label });
