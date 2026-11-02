import type { Layer, VectorPath } from "../../model/studio-types";
import {
  NUMERIC_PROPS,
  COLOR_PROPS,
  STEP_PROPS,
  BOOL_PROPS,
  OBJECT_PROPS,
  NUMERIC_DEFAULTS,
  BOOL_DEFAULTS,
  PATH_PROP,
  type NumericProp,
  type BoolProp,
} from "../../model/animation-types";
import { interpolatePath } from "../interpolate-path";
import { lerp, lerpColor, interpolateValue } from "./interpolate-values";
import type { TrackSample } from "./sample-track";

type Writable = Record<string, unknown>;

const NUMERIC_SET = new Set<string>(NUMERIC_PROPS);
const COLOR_SET = new Set<string>(COLOR_PROPS);
const STEP_SET = new Set<string>(STEP_PROPS);
const BOOL_SET = new Set<string>(BOOL_PROPS);
const OBJECT_SET = new Set<string>(OBJECT_PROPS);
const DEFAULT_COLOR = "#000000";

const read = (record: Writable, prop: string): unknown => record[prop];

const hasOverride = (sample: TrackSample, prop: string): boolean =>
  read(sample.from as Writable, prop) !== undefined || read(sample.to as Writable, prop) !== undefined;

const pick = <T>(sample: TrackSample, prop: string, fallback: T, guard: (value: unknown) => boolean): [T, T] => {
  const from = read(sample.from as Writable, prop);
  const to = read(sample.to as Writable, prop);
  return [guard(from) ? (from as T) : fallback, guard(to) ? (to as T) : fallback];
};

const isNumber = (value: unknown): boolean => typeof value === "number";
const isString = (value: unknown): boolean => typeof value === "string";
const isBoolean = (value: unknown): boolean => typeof value === "boolean";
const isDefined = (value: unknown): boolean => value !== undefined;

const applyNumeric = (next: Writable, base: unknown, prop: string, sample: TrackSample): void => {
  if (typeof base !== "number" && !hasOverride(sample, prop)) return;
  const fallback = typeof base === "number" ? base : NUMERIC_DEFAULTS[prop as NumericProp] ?? 0;
  const [from, to] = pick(sample, prop, fallback, isNumber);
  next[prop] = lerp(from, to, sample.progress);
};

const applyColor = (next: Writable, base: unknown, prop: string, sample: TrackSample): void => {
  if (typeof base !== "string" && !hasOverride(sample, prop)) return;
  const fallback = typeof base === "string" ? base : DEFAULT_COLOR;
  const [from, to] = pick(sample, prop, fallback, isString);
  next[prop] = lerpColor(from, to, sample.progress);
};

const applyStep = (next: Writable, base: unknown, prop: string, sample: TrackSample): void => {
  if (!hasOverride(sample, prop)) return;
  const [from, to] = pick(sample, prop, typeof base === "string" ? base : "", isString);
  next[prop] = sample.progress < 1 ? from : to;
};

const applyBool = (next: Writable, base: unknown, prop: string, sample: TrackSample): void => {
  if (!hasOverride(sample, prop)) return;
  const fallback = typeof base === "boolean" ? base : BOOL_DEFAULTS[prop as BoolProp];
  const [from, to] = pick(sample, prop, fallback, isBoolean);
  next[prop] = sample.progress < 1 ? from : to;
};

const applyObject = (next: Writable, base: unknown, prop: string, sample: TrackSample): void => {
  if (base === undefined && !hasOverride(sample, prop)) return;
  const [from, to] = pick(sample, prop, base, isDefined);
  next[prop] = interpolateValue(from, to, sample.progress);
};

const applyPath = (next: Writable, layer: Layer, sample: TrackSample): void => {
  if (layer.type !== "vector" || !hasOverride(sample, PATH_PROP)) return;
  const from = (sample.from.path as VectorPath | undefined) ?? layer.path;
  const to = (sample.to.path as VectorPath | undefined) ?? layer.path;
  next.path = interpolatePath(from, to, sample.progress);
};

const applyProp = (next: Writable, layer: Layer, prop: string, sample: TrackSample): void => {
  const base = (layer as unknown as Writable)[prop];
  if (NUMERIC_SET.has(prop)) applyNumeric(next, base, prop, sample);
  else if (COLOR_SET.has(prop)) applyColor(next, base, prop, sample);
  else if (STEP_SET.has(prop)) applyStep(next, base, prop, sample);
  else if (BOOL_SET.has(prop)) applyBool(next, base, prop, sample);
  else if (OBJECT_SET.has(prop)) applyObject(next, base, prop, sample);
  else if (prop === PATH_PROP) applyPath(next, layer, sample);
};

export const applyGroupSample = (
  next: Writable,
  layer: Layer,
  props: readonly string[],
  sample: TrackSample,
): void => {
  for (const prop of props) applyProp(next, layer, prop, sample);
};
