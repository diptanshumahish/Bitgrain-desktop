import type { BezierAnchor, BezierHandle, DashStyle, VectorPath } from "../data/studioTypes";

interface Point { x: number; y: number; }

const DEFAULT_TENSION = 0.4;
const HANDLE_DIVISOR = 3;
const FIXED_DIGITS = 2;
const DASH_LENGTH_RATIO = 3;
const DASH_GAP_RATIO = 2;
const DOT_GAP_RATIO = 2;

export const dashArrayFor = (style: DashStyle, strokeWidth: number): string | undefined => {
  if (style === "dashed") return `${strokeWidth * DASH_LENGTH_RATIO} ${strokeWidth * DASH_GAP_RATIO}`;
  if (style === "dotted") return `${strokeWidth} ${strokeWidth * DOT_GAP_RATIO}`;
  return undefined;
};

const perpDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  if (dx === 0 && dy === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
  const projection = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
  return Math.sqrt((point.x - (lineStart.x + projection * dx)) ** 2 + (point.y - (lineStart.y + projection * dy)) ** 2);
};

export const simplifyPoints = (points: Point[], epsilon: number): Point[] => {
  if (points.length < 3) return points;
  let maxDist = 0;
  let maxIdx = 0;
  for (let index = 1; index < points.length - 1; index++) {
    const distance = perpDistance(points[index], points[0], points[points.length - 1]);
    if (distance > maxDist) { maxDist = distance; maxIdx = index; }
  }
  if (maxDist > epsilon) {
    const left = simplifyPoints(points.slice(0, maxIdx + 1), epsilon);
    const right = simplifyPoints(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[points.length - 1]];
};

export const pointsToAnchors = (points: Point[], tension = DEFAULT_TENSION): BezierAnchor[] => {
  if (points.length === 0) return [];
  if (points.length === 1) return [{ x: points[0].x, y: points[0].y }];
  return points.map((point, index) => {
    if (index === 0 || index === points.length - 1) return { x: point.x, y: point.y };
    const prev = points[index - 1];
    const next = points[index + 1];
    return {
      x: point.x, y: point.y,
      outHandle: { x: point.x + (next.x - prev.x) * tension / HANDLE_DIVISOR, y: point.y + (next.y - prev.y) * tension / HANDLE_DIVISOR },
      inHandle: { x: point.x - (next.x - prev.x) * tension / HANDLE_DIVISOR, y: point.y - (next.y - prev.y) * tension / HANDLE_DIVISOR },
    };
  });
};

const fmt = (value: number): string => value.toFixed(FIXED_DIGITS);

export const anchorsToPath = (anchors: BezierAnchor[], closed: boolean): string => {
  if (anchors.length === 0) return "";
  let path = `M ${fmt(anchors[0].x)} ${fmt(anchors[0].y)}`;

  for (let index = 0; index < anchors.length - 1; index++) {
    const start = anchors[index];
    const end = anchors[index + 1];
    const cp1: BezierHandle = start.outHandle ?? { x: start.x, y: start.y };
    const cp2: BezierHandle = end.inHandle ?? { x: end.x, y: end.y };
    path += ` C ${fmt(cp1.x)} ${fmt(cp1.y)} ${fmt(cp2.x)} ${fmt(cp2.y)} ${fmt(end.x)} ${fmt(end.y)}`;
  }

  if (closed && anchors.length >= 2) {
    const last = anchors[anchors.length - 1];
    const first = anchors[0];
    const cp1: BezierHandle = last.outHandle ?? { x: last.x, y: last.y };
    const cp2: BezierHandle = first.inHandle ?? { x: first.x, y: first.y };
    path += ` C ${fmt(cp1.x)} ${fmt(cp1.y)} ${fmt(cp2.x)} ${fmt(cp2.y)} ${fmt(first.x)} ${fmt(first.y)} Z`;
  }

  return path;
};

export const vectorPathToD = (path: VectorPath): string => {
  const primary = anchorsToPath(path.anchors, path.closed);
  const extras = (path.extraRings ?? []).map((ring) => anchorsToPath(ring, true));
  return [primary, ...extras].filter(Boolean).join(" ");
};

export const previewSegment = (
  lastAnchor: BezierAnchor,
  toPoint: { x: number; y: number; inHandle?: BezierHandle },
): string => {
  const cp1: BezierHandle = lastAnchor.outHandle ?? { x: lastAnchor.x, y: lastAnchor.y };
  const cp2: BezierHandle = toPoint.inHandle ?? { x: toPoint.x, y: toPoint.y };
  return `M ${fmt(lastAnchor.x)} ${fmt(lastAnchor.y)} C ${fmt(cp1.x)} ${fmt(cp1.y)} ${fmt(cp2.x)} ${fmt(cp2.y)} ${fmt(toPoint.x)} ${fmt(toPoint.y)}`;
};

export const dist = (start: { x: number; y: number }, end: { x: number; y: number }): number =>
  Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2);
