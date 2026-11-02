import type { PaintGradient, PaintStop } from "@bitgrain/studio-core/model/paint-types";
import { resolveStops, sampleStops } from "@bitgrain/studio-core/shape-render/paint/gradient-stops";
import { rgbHex } from "@bitgrain/studio-core/shape-render/paint/color-parse";

const MIN_STOPS = 2;

const clampUnit = (value: number): number => Math.max(0, Math.min(1, value));

export const updateStop = (gradient: PaintGradient, index: number, updates: Partial<PaintStop>): PaintGradient => ({
  ...gradient,
  stops: gradient.stops.map((stop, stopIndex) => (stopIndex === index ? { ...stop, ...updates } : stop)),
});

export const addStopAt = (gradient: PaintGradient, pos: number): PaintGradient => {
  const sampled = sampleStops(resolveStops(gradient.stops), clampUnit(pos));
  const stop: PaintStop = { color: rgbHex(sampled), opacity: Number(sampled.a.toFixed(2)), pos: clampUnit(pos) };
  return { ...gradient, stops: [...gradient.stops, stop] };
};

export const removeStop = (gradient: PaintGradient, index: number): PaintGradient =>
  gradient.stops.length <= MIN_STOPS ? gradient : { ...gradient, stops: gradient.stops.filter((_, stopIndex) => stopIndex !== index) };

export const canRemoveStop = (gradient: PaintGradient): boolean => gradient.stops.length > MIN_STOPS;

export const clampStopPos = clampUnit;
