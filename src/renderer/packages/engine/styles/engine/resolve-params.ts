import type { ParamSpec, ParamValue, ParamValues } from "./style-types";

const isSameKind = (spec: ParamSpec, value: ParamValue): boolean => {
  if (spec.kind === "number") return typeof value === "number" && Number.isFinite(value);
  if (spec.kind === "toggle") return typeof value === "boolean";
  return typeof value === "string";
};

const clampToSpec = (spec: ParamSpec, value: ParamValue): ParamValue => {
  if (spec.kind === "number") return Math.min(spec.max, Math.max(spec.min, value as number));
  if (spec.kind === "select") return spec.options.some((option) => option.value === value) ? value : spec.default;
  return value;
};

const pickValue = (spec: ParamSpec, overrides: ParamValues): ParamValue => {
  const candidate = overrides[spec.key];
  if (candidate === undefined || !isSameKind(spec, candidate)) return spec.default;
  return clampToSpec(spec, candidate);
};

const scaleValue = (spec: ParamSpec, value: ParamValue, scale: number): ParamValue =>
  spec.kind === "number" && spec.scalesWithExport ? (value as number) * scale : value;

export const resolveParams = (specs: readonly ParamSpec[], overrides: ParamValues, scale: number): ParamValues =>
  Object.fromEntries(specs.map((spec) => [spec.key, scaleValue(spec, pickValue(spec, overrides), scale)]));

export const numberParam = (params: ParamValues, key: string): number => {
  const value = params[key];
  return typeof value === "number" ? value : 0;
};

export const textParam = (params: ParamValues, key: string): string => {
  const value = params[key];
  return typeof value === "string" ? value : "";
};

export const toggleParam = (params: ParamValues, key: string): boolean => params[key] === true;
