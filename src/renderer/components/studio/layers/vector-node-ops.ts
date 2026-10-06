import type {
  BezierAnchor,
  BezierHandle,
  AnchorCornerType,
} from "../../../data/studioTypes";

const lerp = (a: BezierHandle, b: BezierHandle, t: number): BezierHandle => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const splitCubicBezier = (
  a: BezierAnchor,
  b: BezierAnchor,
  t: number,
): { updatedA: BezierAnchor; inserted: BezierAnchor; updatedB: BezierAnchor } => {
  const p0: BezierHandle = { x: a.x, y: a.y };
  const p1: BezierHandle = a.outHandle ?? { x: a.x, y: a.y };
  const p2: BezierHandle = b.inHandle ?? { x: b.x, y: b.y };
  const p3: BezierHandle = { x: b.x, y: b.y };

  const q0 = lerp(p0, p1, t);
  const q1 = lerp(p1, p2, t);
  const q2 = lerp(p2, p3, t);
  const r0 = lerp(q0, q1, t);
  const r1 = lerp(q1, q2, t);
  const s = lerp(r0, r1, t);

  return {
    updatedA: { ...a, outHandle: q0 },
    inserted: { x: s.x, y: s.y, inHandle: r0, outHandle: r1, cornerType: "smooth" },
    updatedB: { ...b, inHandle: q2 },
  };
};

const FIND_T_SAMPLES = 64;
const FIND_T_REFINE_ITERATIONS = 24;

export const findTOnSegment = (
  start: BezierAnchor,
  end: BezierAnchor,
  pointX: number,
  pointY: number,
): number => {
  const squaredDistanceAt = (t: number): number => {
    const point = cubicPointAt(start, end, t);
    const deltaX = point.x - pointX;
    const deltaY = point.y - pointY;
    return deltaX * deltaX + deltaY * deltaY;
  };
  let bestT = 0;
  let bestDistance = Infinity;
  for (let i = 0; i <= FIND_T_SAMPLES; i++) {
    const t = i / FIND_T_SAMPLES;
    const distance = squaredDistanceAt(t);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestT = t;
    }
  }
  let lo = Math.max(0, bestT - 1 / FIND_T_SAMPLES);
  let hi = Math.min(1, bestT + 1 / FIND_T_SAMPLES);
  for (let i = 0; i < FIND_T_REFINE_ITERATIONS; i++) {
    const mid1 = lo + (hi - lo) / 3;
    const mid2 = hi - (hi - lo) / 3;
    if (squaredDistanceAt(mid1) < squaredDistanceAt(mid2)) hi = mid2;
    else lo = mid1;
  }
  return (lo + hi) / 2;
};

export const moveAnchor = (
  anchors: BezierAnchor[],
  idx: number,
  dx: number,
  dy: number,
): BezierAnchor[] =>
  anchors.map((a, i) => {
    if (i !== idx) return a;
    return {
      ...a,
      x: a.x + dx,
      y: a.y + dy,
      inHandle: a.inHandle ? { x: a.inHandle.x + dx, y: a.inHandle.y + dy } : undefined,
      outHandle: a.outHandle ? { x: a.outHandle.x + dx, y: a.outHandle.y + dy } : undefined,
    };
  });

const mirrorOpposite = (anchor: BezierAnchor, moved: BezierHandle): BezierHandle => ({
  x: anchor.x - (moved.x - anchor.x),
  y: anchor.y - (moved.y - anchor.y),
});

export const moveHandle = (
  anchors: BezierAnchor[],
  idx: number,
  handleType: "inHandle" | "outHandle",
  dx: number,
  dy: number,
): BezierAnchor[] =>
  anchors.map((a, i) => {
    if (i !== idx) return a;
    const cornerType: AnchorCornerType = a.cornerType ?? "smooth";
    if (handleType === "outHandle") {
      const cur = a.outHandle ?? { x: a.x, y: a.y };
      const newOut = { x: cur.x + dx, y: cur.y + dy };
      if (cornerType === "asymmetric" || cornerType === "corner") {
        return { ...a, outHandle: newOut };
      }
      return { ...a, outHandle: newOut, inHandle: mirrorOpposite(a, newOut) };
    }
    const cur = a.inHandle ?? { x: a.x, y: a.y };
    const newIn = { x: cur.x + dx, y: cur.y + dy };
    if (cornerType === "asymmetric" || cornerType === "corner") {
      return { ...a, inHandle: newIn };
    }
    return { ...a, inHandle: newIn, outHandle: mirrorOpposite(a, newIn) };
  });

export const deleteAnchor = (
  anchors: BezierAnchor[],
  idx: number,
): BezierAnchor[] => anchors.filter((_, i) => i !== idx);

const T_BEND_MIN = 0.15;
const T_BEND_MAX = 0.85;

export const bendSegment = (
  anchors: BezierAnchor[],
  segmentIdx: number,
  closed: boolean,
  dx: number,
  dy: number,
  t: number,
): BezierAnchor[] => {
  const tClamped = Math.max(T_BEND_MIN, Math.min(T_BEND_MAX, t));
  const factor = 1 / (3 * tClamped * (1 - tClamped));
  const ox = dx * factor;
  const oy = dy * factor;
  const aIdx = segmentIdx;
  const bIdx = closed ? (segmentIdx + 1) % anchors.length : segmentIdx + 1;
  return anchors.map((anchor, i) => {
    if (i === aIdx) {
      const cur = anchor.outHandle ?? { x: anchor.x, y: anchor.y };
      return {
        ...anchor,
        cornerType: anchor.cornerType ?? "smooth",
        outHandle: { x: cur.x + ox, y: cur.y + oy },
      };
    }
    if (i === bIdx) {
      const cur = anchor.inHandle ?? { x: anchor.x, y: anchor.y };
      return {
        ...anchor,
        cornerType: anchor.cornerType ?? "smooth",
        inHandle: { x: cur.x + ox, y: cur.y + oy },
      };
    }
    return anchor;
  });
};

export const cubicPointAt = (
  a: BezierAnchor,
  b: BezierAnchor,
  t: number,
): { x: number; y: number } => {
  const p0 = { x: a.x, y: a.y };
  const p1 = a.outHandle ?? p0;
  const p3 = { x: b.x, y: b.y };
  const p2 = b.inHandle ?? p3;
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

export const toggleAnchorCorner = (
  anchors: BezierAnchor[],
  idx: number,
): BezierAnchor[] =>
  anchors.map((a, i) => {
    if (i !== idx) return a;
    const current: AnchorCornerType = a.cornerType ?? (a.inHandle || a.outHandle ? "smooth" : "corner");
    if (current === "corner") {
      const next = anchors[(i + 1) % anchors.length];
      const prev = anchors[(i - 1 + anchors.length) % anchors.length];
      const dx = (next.x - prev.x) / 6;
      const dy = (next.y - prev.y) / 6;
      return {
        ...a,
        cornerType: "smooth",
        inHandle: { x: a.x - dx, y: a.y - dy },
        outHandle: { x: a.x + dx, y: a.y + dy },
      };
    }
    return { ...a, cornerType: "corner", inHandle: undefined, outHandle: undefined };
  });
