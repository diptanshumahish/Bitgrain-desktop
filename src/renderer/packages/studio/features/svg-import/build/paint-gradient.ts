import type { PaintGradient } from "@bitgrain/studio-core/model/paint-types";
import type { Point } from "../geometry/matrix";
import type { IrGradient, IrPaint } from "../walk/svg-ir";
import type { NormalBox } from "./subpath-anchors";

const MIN_LENGTH = 1e-6;
const FALLBACK_COLOR = "transparent";

const normalizePoint = (point: Point, box: NormalBox): Point => ({
  x: (point.x - box.x) / box.width,
  y: (point.y - box.y) / box.height,
});

const radialAspect = (gradient: IrGradient): number => {
  const major = Math.hypot(gradient.end.x - gradient.start.x, gradient.end.y - gradient.start.y);
  const minor = Math.hypot(gradient.minorEnd.x - gradient.start.x, gradient.minorEnd.y - gradient.start.y);
  return major > MIN_LENGTH ? minor / major : 1;
};

const toPaintGradient = (gradient: IrGradient, box: NormalBox): PaintGradient => ({
  kind: gradient.kind,
  stops: gradient.stops.map((stop) => ({ color: stop.color, opacity: stop.opacity, pos: stop.pos })),
  start: normalizePoint(gradient.start, box),
  end: normalizePoint(gradient.end, box),
  aspect: gradient.kind === "radial" ? radialAspect(gradient) : 1,
});

const stopColor = (gradient: IrGradient): string => gradient.stops[0]?.color ?? FALLBACK_COLOR;

export const paintColor = (paint: IrPaint): string => {
  if (paint.kind === "color") return paint.color;
  if (paint.kind === "gradient") return stopColor(paint.gradient);
  return FALLBACK_COLOR;
};

export const paintGradient = (paint: IrPaint, box: NormalBox): PaintGradient | undefined =>
  paint.kind === "gradient" ? toPaintGradient(paint.gradient, box) : undefined;
