import type { EdgeStyle, TornEdgeEffect } from "../data/studioTypes";

export interface TornPoint {
  x: number;
  y: number;
}

export interface TornGeometry {
  outer: TornPoint[];
  inner: TornPoint[];
}

const MAX_DEPTH_FRACTION = 0.16;
const MIN_SEGMENTS = 3;
const MAX_INSET_FRACTION = 0.45;
const DIAGONAL = Math.SQRT1_2;
const DECKLE_WAVES = 3;
const POLAROID_BOTTOM_MULTIPLIER = 2.4;

export const defaultTornEdge = (seed: number): TornEdgeEffect => ({
  style: "torn",
  sides: { top: true, right: true, bottom: true, left: true },
  roughness: 50,
  detail: 16,
  border: 10,
  borderColor: "#ffffff",
  frame: "paper",
  seed,
});

export const hashStringSeed = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

interface EdgeSpec {
  start: TornPoint;
  end: TornPoint;
  inward: TornPoint;
  torn: boolean;
}

const cornerInward = (a: TornPoint, b: TornPoint): TornPoint => ({
  x: (a.x + b.x) * DIAGONAL,
  y: (a.y + b.y) * DIAGONAL,
});

const samplesForStyle = (style: EdgeStyle, detail: number): number => {
  if (style === "perforation") return Math.max(3, Math.round(detail / 3)) * 6;
  if (style === "deckle") return Math.max(14, Math.round(detail));
  return Math.max(MIN_SEGMENTS, Math.round(detail));
};

const depthForStyle = (
  style: EdgeStyle,
  t: number,
  maxDepth: number,
  phase: number,
  holes: number,
  random: () => number,
): number => {
  if (style === "deckle") {
    const taper = Math.sin(t * Math.PI);
    const wave = 0.6 + 0.4 * Math.sin(t * Math.PI * DECKLE_WAVES + phase);
    return maxDepth * 0.55 * wave * taper;
  }
  if (style === "perforation") {
    const taper = 0.45 + 0.55 * Math.sin(t * Math.PI);
    const scallop = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 * holes);
    return maxDepth * scallop * taper;
  }
  return random() * maxDepth;
};

export const buildTornEdge = (
  width: number,
  height: number,
  effect: TornEdgeEffect,
  baseSeed: number,
): TornGeometry => {
  const style: EdgeStyle = effect.style ?? "torn";
  const samples = samplesForStyle(style, effect.detail);
  const holes = Math.max(3, Math.round(effect.detail / 3));
  const shortSide = Math.min(width, height);
  const maxInset = shortSide * MAX_INSET_FRACTION;
  const border = Math.min(Math.max(0, effect.border), maxInset);
  const extraBottom = effect.frame === "polaroid" ? Math.min(border * POLAROID_BOTTOM_MULTIPLIER, maxInset - border) : 0;
  const maxDepth = Math.max(
    0,
    Math.min(
      (Math.max(0, effect.roughness) / 100) * shortSide * MAX_DEPTH_FRACTION,
      maxInset - border - extraBottom,
    ),
  );

  const topLeft: TornPoint = { x: 0, y: 0 };
  const topRight: TornPoint = { x: width, y: 0 };
  const bottomRight: TornPoint = { x: width, y: height };
  const bottomLeft: TornPoint = { x: 0, y: height };

  const edges: EdgeSpec[] = [
    { start: topLeft, end: topRight, inward: { x: 0, y: 1 }, torn: effect.sides.top },
    { start: topRight, end: bottomRight, inward: { x: -1, y: 0 }, torn: effect.sides.right },
    { start: bottomRight, end: bottomLeft, inward: { x: 0, y: -1 }, torn: effect.sides.bottom },
    { start: bottomLeft, end: topLeft, inward: { x: 1, y: 0 }, torn: effect.sides.left },
  ];

  const cornerInwards = [
    cornerInward(edges[3].inward, edges[0].inward),
    cornerInward(edges[0].inward, edges[1].inward),
    cornerInward(edges[1].inward, edges[2].inward),
    cornerInward(edges[2].inward, edges[3].inward),
  ];

  const random = createRandom((baseSeed ^ Math.imul((effect.seed ?? 0) >>> 0, 0x9e3779b1)) >>> 0);
  const outer: TornPoint[] = [];
  const inner: TornPoint[] = [];

  edges.forEach((edge, edgeIndex) => {
    const cornerNormal = cornerInwards[edgeIndex];
    const isBottomEdge = edgeIndex === 2;
    const startIsBottom = edge.start.y === height;
    const phase = edgeIndex * 1.7 + ((effect.seed ?? 0) % 360) * (Math.PI / 180);

    outer.push({ x: edge.start.x, y: edge.start.y });
    inner.push({
      x: edge.start.x + cornerNormal.x * border,
      y: edge.start.y + cornerNormal.y * border - (startIsBottom ? extraBottom : 0),
    });

    for (let step = 1; step < samples; step += 1) {
      const t = step / samples;
      const baseX = edge.start.x + (edge.end.x - edge.start.x) * t;
      const baseY = edge.start.y + (edge.end.y - edge.start.y) * t;
      const depth = edge.torn ? depthForStyle(style, t, maxDepth, phase, holes, random) : 0;
      const edgeBorder = border + (isBottomEdge ? extraBottom : 0);
      outer.push({
        x: baseX + edge.inward.x * depth,
        y: baseY + edge.inward.y * depth,
      });
      inner.push({
        x: baseX + edge.inward.x * (depth + edgeBorder),
        y: baseY + edge.inward.y * (depth + edgeBorder),
      });
    }
  });

  return { outer, inner };
};

export const polygonToCssClip = (
  points: TornPoint[],
  width: number,
  height: number,
): string => {
  const safeWidth = width || 1;
  const safeHeight = height || 1;
  const pairs = points.map((point) => {
    const px = (point.x / safeWidth) * 100;
    const py = (point.y / safeHeight) * 100;
    return `${px.toFixed(3)}% ${py.toFixed(3)}%`;
  });
  return `polygon(${pairs.join(", ")})`;
};
