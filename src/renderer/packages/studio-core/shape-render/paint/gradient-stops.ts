import type { PaintStop } from "../../model/paint-types";
import { parseColor, type Rgba } from "./color-parse";

export interface ResolvedStop {
  pos: number;
  hex: string;
  rgba: Rgba;
}

const clampUnit = (value: number): number => Math.max(0, Math.min(1, value));

export const resolveStops = (stops: PaintStop[]): ResolvedStop[] =>
  [...stops]
    .sort((left, right) => left.pos - right.pos)
    .map((stop) => {
      const parsed = parseColor(stop.color);
      const rgba = { ...parsed, a: parsed.a * clampUnit(stop.opacity) };
      return { pos: clampUnit(stop.pos), hex: stop.color, rgba };
    });

const mix = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const sampleStops = (stops: ResolvedStop[], t: number): Rgba => {
  if (stops.length === 0) return { r: 0, g: 0, b: 0, a: 0 };
  if (t <= stops[0].pos) return stops[0].rgba;
  const last = stops[stops.length - 1];
  if (t >= last.pos) return last.rgba;
  const upperIndex = stops.findIndex((stop) => stop.pos >= t);
  const lower = stops[upperIndex - 1];
  const upper = stops[upperIndex];
  const span = upper.pos - lower.pos;
  const amount = span > 0 ? (t - lower.pos) / span : 0;
  return {
    r: mix(lower.rgba.r, upper.rgba.r, amount),
    g: mix(lower.rgba.g, upper.rgba.g, amount),
    b: mix(lower.rgba.b, upper.rgba.b, amount),
    a: mix(lower.rgba.a, upper.rgba.a, amount),
  };
};
