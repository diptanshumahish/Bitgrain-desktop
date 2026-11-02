import type { Frame } from "../engine/frame";
import type { RandomSource } from "../engine/seeded-random";
import type { ParamSpec, ParamValues } from "../engine/style-types";

export interface EffectPreset {
  name: string;
  values: ParamValues;
}

export interface EffectInput {
  frame: Frame;
  values: ParamValues;
  scale: number;
  random: RandomSource;
}

export interface EffectDefinition {
  key: string;
  label: string;
  hint: string;
  params: readonly ParamSpec[];
  presets?: readonly EffectPreset[];
  apply: (input: EffectInput) => void;
}

export const percentParam = (key: string, label: string, defaultValue: number, advanced = false): ParamSpec => ({
  kind: "number", key, label, min: 0, max: 100, step: 1, default: defaultValue, suffix: "%", advanced,
});

export const pixelParam = (key: string, label: string, min: number, max: number, defaultValue: number, advanced = false): ParamSpec => ({
  kind: "number", key, label, min, max, step: 1, default: defaultValue, suffix: "px", advanced, scalesWithExport: true,
});
