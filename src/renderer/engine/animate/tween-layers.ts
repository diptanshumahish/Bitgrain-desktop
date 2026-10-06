import type { Layer, VectorPath } from "../../data/studioTypes";
import type { EasingId, PageAnimation } from "../../data/animation-types";
import { NUMERIC_PROPS, COLOR_PROPS, STEP_PROPS, BOOL_PROPS, OBJECT_PROPS, NUMERIC_DEFAULTS, BOOL_DEFAULTS } from "../../data/animation-types";
import { interpolatePath } from "./interpolate-path";

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

const BACK_C1 = 1.70158;
const BACK_C3 = BACK_C1 + 1;

const EASINGS: Record<EasingId, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t,
  "ease-out": (t) => 1 - (1 - t) * (1 - t),
  "ease-in-out": (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  spring: (t) => 1 + BACK_C3 * Math.pow(t - 1, 3) + BACK_C1 * Math.pow(t - 1, 2),
  hold: () => 0,
};

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const parseColor = (value: string): Rgb | null => {
  const input = value.trim();
  const hex = input.startsWith("#") ? input.slice(1) : null;
  if (hex && (hex.length === 3 || hex.length === 6)) {
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const num = parseInt(full, 16);
    if (Number.isNaN(num)) return null;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  const match = input.match(/rgba?\(([^)]+)\)/);
  if (match) {
    const parts = match[1].split(",").map((part) => parseFloat(part));
    if (parts.length >= 3) return { r: parts[0], g: parts[1], b: parts[2] };
  }
  return null;
};

const toHex = (channel: number): string =>
  Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0");

const lerpColor = (from: string, to: string, t: number): string => {
  const a = parseColor(from);
  const b = parseColor(to);
  if (!a || !b) return t < 0.5 ? from : to;
  return `#${toHex(a.r + (b.r - a.r) * t)}${toHex(a.g + (b.g - a.g) * t)}${toHex(a.b + (b.b - a.b) * t)}`;
};

const isColorLike = (value: string): boolean => /^#|^rgb/i.test(value.trim());

const interpolateValue = (from: unknown, to: unknown, t: number): unknown => {
  if (typeof from === "number" && typeof to === "number") return lerp(from, to, t);
  if (typeof from === "string" && typeof to === "string") {
    return isColorLike(from) && isColorLike(to) ? lerpColor(from, to, t) : t < 1 ? from : to;
  }
  if (typeof from === "boolean") return t < 1 ? from : to;
  if (Array.isArray(from) && Array.isArray(to)) {
    if (from.length !== to.length) return t < 0.5 ? from : to;
    return from.map((value, index) => interpolateValue(value, to[index], t));
  }
  if (from && to && typeof from === "object" && typeof to === "object") {
    const fromRecord = from as Record<string, unknown>;
    const toRecord = to as Record<string, unknown>;
    const keys = new Set([...Object.keys(fromRecord), ...Object.keys(toRecord)]);
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      const fromValue = fromRecord[key];
      const toValue = toRecord[key];
      if (fromValue === undefined) out[key] = toValue;
      else if (toValue === undefined) out[key] = fromValue;
      else out[key] = interpolateValue(fromValue, toValue, t);
    }
    return out;
  }
  return t < 1 ? from : to;
};

interface Segment {
  fromId: string;
  toId: string;
  durationMs: number;
  easing: EasingId;
}

const buildSegments = (animation: PageAnimation): Segment[] => {
  const frames = animation.frames;
  const segments: Segment[] = [];
  for (let index = 0; index < frames.length - 1; index += 1) {
    const target = frames[index + 1];
    segments.push({
      fromId: frames[index].id,
      toId: target.id,
      durationMs: Math.max(1, target.durationMs),
      easing: target.easing,
    });
  }
  if (animation.loop && frames.length > 1) {
    segments.push({
      fromId: frames[frames.length - 1].id,
      toId: frames[0].id,
      durationMs: Math.max(1, frames[0].durationMs),
      easing: frames[0].easing,
    });
  }
  return segments;
};

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

const frameEntry = (
  layer: Layer,
  frameId: string,
): Record<string, unknown> | undefined =>
  layer.anim?.[frameId] as Record<string, unknown> | undefined;

const resolveNumeric = (layer: Layer, frameId: string, prop: string, fallback: number): number => {
  const value = frameEntry(layer, frameId)?.[prop];
  return typeof value === "number" ? value : fallback;
};

const resolveColor = (layer: Layer, frameId: string, prop: string, fallback: string): string => {
  const value = frameEntry(layer, frameId)?.[prop];
  return typeof value === "string" ? value : fallback;
};

const resolveStep = (layer: Layer, frameId: string, prop: string, fallback: string): string => {
  const value = frameEntry(layer, frameId)?.[prop];
  return typeof value === "string" ? value : fallback;
};

const resolveBool = (layer: Layer, frameId: string, prop: string, fallback: boolean): boolean => {
  const value = frameEntry(layer, frameId)?.[prop];
  return typeof value === "boolean" ? value : fallback;
};

const resolveObject = (layer: Layer, frameId: string, prop: string, fallback: unknown): unknown => {
  const value = frameEntry(layer, frameId)?.[prop];
  return value !== undefined ? value : fallback;
};

const resolvePath = (layer: Layer, frameId: string): VectorPath | undefined => {
  const value = frameEntry(layer, frameId)?.path;
  return value as VectorPath | undefined;
};

const hasOverride = (layer: Layer, fromId: string, toId: string, prop: string): boolean =>
  frameEntry(layer, fromId)?.[prop] !== undefined || frameEntry(layer, toId)?.[prop] !== undefined;

const interpolateLayer = (
  layer: Layer,
  fromId: string,
  toId: string,
  t: number,
): Layer => {
  const next = { ...layer } as unknown as Record<string, unknown>;
  const source = layer as unknown as Record<string, unknown>;

  for (const prop of NUMERIC_PROPS) {
    const base = source[prop];
    if (typeof base !== "number" && !hasOverride(layer, fromId, toId, prop)) continue;
    const fallback = typeof base === "number" ? base : NUMERIC_DEFAULTS[prop] ?? 0;
    next[prop] = lerp(
      resolveNumeric(layer, fromId, prop, fallback),
      resolveNumeric(layer, toId, prop, fallback),
      t,
    );
  }

  for (const prop of COLOR_PROPS) {
    const base = source[prop];
    if (typeof base !== "string" && !hasOverride(layer, fromId, toId, prop)) continue;
    const fallback = typeof base === "string" ? base : "#000000";
    next[prop] = lerpColor(
      resolveColor(layer, fromId, prop, fallback),
      resolveColor(layer, toId, prop, fallback),
      t,
    );
  }

  for (const prop of STEP_PROPS) {
    if (!hasOverride(layer, fromId, toId, prop)) continue;
    const base = typeof source[prop] === "string" ? (source[prop] as string) : "";
    next[prop] = t < 1 ? resolveStep(layer, fromId, prop, base) : resolveStep(layer, toId, prop, base);
  }

  for (const prop of BOOL_PROPS) {
    if (!hasOverride(layer, fromId, toId, prop)) continue;
    const base = typeof source[prop] === "boolean" ? (source[prop] as boolean) : BOOL_DEFAULTS[prop];
    next[prop] = t < 1 ? resolveBool(layer, fromId, prop, base) : resolveBool(layer, toId, prop, base);
  }

  for (const prop of OBJECT_PROPS) {
    const base = source[prop];
    if (base === undefined && !hasOverride(layer, fromId, toId, prop)) continue;
    next[prop] = interpolateValue(
      resolveObject(layer, fromId, prop, base),
      resolveObject(layer, toId, prop, base),
      t,
    );
  }

  if (layer.type === "vector" && hasOverride(layer, fromId, toId, "path")) {
    next.path = interpolatePath(
      resolvePath(layer, fromId) ?? layer.path,
      resolvePath(layer, toId) ?? layer.path,
      t,
    );
  }

  if (layer.type === "group" || layer.type === "frame") {
    next.layers = layer.layers.map((child) => interpolateLayer(child, fromId, toId, t));
  }
  return next as unknown as Layer;
};

export const resolveFrameLayers = (baseLayers: Layer[], frameId: string): Layer[] =>
  baseLayers.map((layer) => interpolateLayer(layer, frameId, frameId, 0));

export const animationTotalDurationMs = (animation: PageAnimation): number =>
  buildSegments(animation).reduce((sum, segment) => sum + segment.durationMs, 0);

export const frameStartTimes = (animation: PageAnimation): number[] => {
  const times = [0];
  let accumulated = 0;
  for (let index = 1; index < animation.frames.length; index += 1) {
    accumulated += Math.max(1, animation.frames[index].durationMs);
    times.push(accumulated);
  }
  return times;
};

export const interpolatePageLayers = (
  baseLayers: Layer[],
  animation: PageAnimation | undefined,
  timeMs: number,
): Layer[] => {
  if (!animation || animation.frames.length <= 1) return baseLayers;
  const segments = buildSegments(animation);
  if (segments.length === 0) return baseLayers;

  const total = segments.reduce((sum, segment) => sum + segment.durationMs, 0);
  let time = timeMs;
  if (animation.loop) {
    time = ((time % total) + total) % total;
  } else {
    time = Math.min(Math.max(time, 0), total);
  }

  let accumulated = 0;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (time < accumulated + segment.durationMs || index === segments.length - 1) {
      const local = clamp01((time - accumulated) / segment.durationMs);
      const eased = EASINGS[segment.easing](local);
      return baseLayers.map((layer) =>
        interpolateLayer(layer, segment.fromId, segment.toId, eased),
      );
    }
    accumulated += segment.durationMs;
  }
  return baseLayers;
};
