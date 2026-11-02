import type { CornerRadii } from "../../model/paint-types";
import { cornerParams, type CornerParams } from "./corner-params";

const PERCENT = 100;
const DIGITS = 3;

export interface BoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const num = (value: number): string => String(Number(value.toFixed(DIGITS)));

const cornerSegment = (params: CornerParams, signX: number, signY: number, vertical: boolean): string => {
  if (params.radius <= 0) return "";
  const { a, b, c, d, arc, radius } = params;
  const along = (value: number, across: number): string =>
    vertical ? `${num(across * signX)} ${num(value * signY)}` : `${num(value * signX)} ${num(across * signY)}`;
  const firstCurve = `c ${along(a, 0)} ${along(a + b, 0)} ${along(a + b + c, d)}`;
  const arcPart = `a ${num(radius)} ${num(radius)} 0 0 1 ${num(arc * signX)} ${num(arc * signY)}`;
  const secondCurve = vertical
    ? `c ${num(c * signX)} ${num(d * signY)} ${num((b + c) * signX)} ${num(d * signY)} ${num((a + b + c) * signX)} ${num(d * signY)}`
    : `c ${num(d * signX)} ${num(c * signY)} ${num(d * signX)} ${num((b + c) * signY)} ${num(d * signX)} ${num((a + b + c) * signY)}`;
  return `${firstCurve} ${arcPart} ${secondCurve}`;
};

export const smoothCornerPath = (box: BoxRect, radii: CornerRadii, smoothingPercent: number): string => {
  const { x, y, width, height } = box;
  const budget = Math.max(0, Math.min(width, height) / 2);
  const smoothing = Math.max(0, Math.min(PERCENT, smoothingPercent)) / PERCENT;
  const [topLeft, topRight, bottomRight, bottomLeft] = radii.map((radius) => cornerParams(radius, smoothing, budget));
  return [
    `M ${num(x + width - topRight.p)} ${num(y)}`,
    cornerSegment(topRight, 1, 1, false),
    `L ${num(x + width)} ${num(y + height - bottomRight.p)}`,
    cornerSegment(bottomRight, -1, 1, true),
    `L ${num(x + bottomLeft.p)} ${num(y + height)}`,
    cornerSegment(bottomLeft, -1, -1, false),
    `L ${num(x)} ${num(y + topLeft.p)}`,
    cornerSegment(topLeft, 1, -1, true),
    "Z",
  ].filter(Boolean).join(" ");
};
