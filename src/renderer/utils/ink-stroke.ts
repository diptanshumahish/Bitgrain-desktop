import type { InkPoint } from "../data/studioTypes";

const MIN_RADIUS = 0.4;
const TAPER_POINTS = 3;

const fmt = (value: number): string => (Math.round(value * 100) / 100).toString();

export const smoothInkPoints = (points: InkPoint[]): InkPoint[] => {
  if (points.length < 3) return points;
  const out: InkPoint[] = [points[0]];
  for (let index = 1; index < points.length - 1; index++) {
    const prev = points[index - 1];
    const cur = points[index];
    const next = points[index + 1];
    out.push({
      x: (prev.x + cur.x * 2 + next.x) / 4,
      y: (prev.y + cur.y * 2 + next.y) / 4,
      pressure: (prev.pressure + cur.pressure * 2 + next.pressure) / 4,
    });
  }
  out.push(points[points.length - 1]);
  return out;
};

const radiusAt = (points: InkPoint[], index: number, baseWidth: number): number => {
  let radius = Math.max(MIN_RADIUS, (baseWidth / 2) * points[index].pressure);
  const edgeDistance = Math.min(index, points.length - 1 - index);
  if (edgeDistance < TAPER_POINTS) radius *= (edgeDistance + 1) / (TAPER_POINTS + 1);
  return radius;
};

const dotPath = (point: InkPoint, baseWidth: number): string => {
  const radius = Math.max(MIN_RADIUS, (baseWidth / 2) * point.pressure);
  const { x, y } = point;
  return `M ${fmt(x - radius)} ${fmt(y)} a ${fmt(radius)} ${fmt(radius)} 0 1 0 ${fmt(radius * 2)} 0 a ${fmt(radius)} ${fmt(radius)} 0 1 0 ${fmt(-radius * 2)} 0 Z`;
};

export const inkStrokeToPath = (rawPoints: InkPoint[], baseWidth: number): string => {
  const points = smoothInkPoints(rawPoints);
  if (points.length === 0) return "";
  if (points.length === 1) return dotPath(points[0], baseWidth);

  const left: { x: number; y: number }[] = [];
  const right: { x: number; y: number }[] = [];
  for (let index = 0; index < points.length; index++) {
    const prev = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    let normalX = -(next.y - prev.y);
    let normalY = next.x - prev.x;
    const length = Math.hypot(normalX, normalY) || 1;
    normalX /= length;
    normalY /= length;
    const radius = radiusAt(points, index, baseWidth);
    const point = points[index];
    left.push({ x: point.x + normalX * radius, y: point.y + normalY * radius });
    right.push({ x: point.x - normalX * radius, y: point.y - normalY * radius });
  }

  let path = `M ${fmt(left[0].x)} ${fmt(left[0].y)}`;
  for (let index = 1; index < left.length; index++) path += ` L ${fmt(left[index].x)} ${fmt(left[index].y)}`;
  for (let index = right.length - 1; index >= 0; index--) path += ` L ${fmt(right[index].x)} ${fmt(right[index].y)}`;
  return path + " Z";
};
