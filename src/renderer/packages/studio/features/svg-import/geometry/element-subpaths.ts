import type { Point } from "./matrix";
import { polylineSubpath, type Subpath } from "./subpath-types";
import { pathDataToSubpaths } from "./path-to-subpaths";

type AttrReader = (name: string) => number;

const KAPPA = 0.5522847498;
const POINT_PAIR = 2;

interface EllipseSpec {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export const ellipseSubpath = ({ cx, cy, rx, ry }: EllipseSpec): Subpath => {
  const kx = rx * KAPPA;
  const ky = ry * KAPPA;
  return {
    start: { x: cx + rx, y: cy },
    closed: true,
    segments: [
      { c1: { x: cx + rx, y: cy + ky }, c2: { x: cx + kx, y: cy + ry }, end: { x: cx, y: cy + ry } },
      { c1: { x: cx - kx, y: cy + ry }, c2: { x: cx - rx, y: cy + ky }, end: { x: cx - rx, y: cy } },
      { c1: { x: cx - rx, y: cy - ky }, c2: { x: cx - kx, y: cy - ry }, end: { x: cx, y: cy - ry } },
      { c1: { x: cx + kx, y: cy - ry }, c2: { x: cx + rx, y: cy - ky }, end: { x: cx + rx, y: cy } },
    ],
  };
};

interface RectSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
}

const roundedRectData = ({ x, y, width, height, rx, ry }: RectSpec): string =>
  `M${x + rx} ${y}H${x + width - rx}A${rx} ${ry} 0 0 1 ${x + width} ${y + ry}V${y + height - ry}` +
  `A${rx} ${ry} 0 0 1 ${x + width - rx} ${y + height}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + height - ry}` +
  `V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;

export const rectSubpath = (spec: RectSpec): Subpath | null => {
  if (spec.width <= 0 || spec.height <= 0) return null;
  if (spec.rx > 0 && spec.ry > 0) return pathDataToSubpaths(roundedRectData(spec))[0] ?? null;
  const { x, y, width, height } = spec;
  return polylineSubpath([{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }], true);
};

export const resolveRectSpec = (read: AttrReader, hasRx: boolean, hasRy: boolean): RectSpec => {
  const width = read("width");
  const height = read("height");
  const rawRx = hasRx ? read("rx") : read("ry");
  const rawRy = hasRy ? read("ry") : rawRx;
  return {
    x: read("x"), y: read("y"), width, height,
    rx: Math.min(Math.max(0, rawRx), width / 2),
    ry: Math.min(Math.max(0, rawRy), height / 2),
  };
};

export const parsePointList = (value: string | null): Point[] => {
  const numbers = (value ?? "").match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];
  const points: Point[] = [];
  for (let index = 0; index + 1 < numbers.length; index += POINT_PAIR) {
    points.push({ x: numbers[index], y: numbers[index + 1] });
  }
  return points;
};
