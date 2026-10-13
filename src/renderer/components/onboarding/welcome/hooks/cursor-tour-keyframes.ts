export interface TourPoint {
  x: number;
  y: number;
  clickAtMs: number;
}

const TRAVEL_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const ARRIVE_EARLY_MS = 90;
const RELEASE_AFTER_MS = 140;
const PRESS_SCALE = 0.8;
const FADE_IN_MS = 300;
const TAIL_MS = 700;

interface TimedFrame {
  atMs: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

const stopFrames = (point: TourPoint, from: TimedFrame, travelMs: number): TimedFrame[] => [
  { ...from, atMs: Math.max(from.atMs, point.clickAtMs - travelMs) },
  { atMs: point.clickAtMs - ARRIVE_EARLY_MS, x: point.x, y: point.y, scale: 1, opacity: 1 },
  { atMs: point.clickAtMs, x: point.x, y: point.y, scale: PRESS_SCALE, opacity: 1 },
  { atMs: point.clickAtMs + RELEASE_AFTER_MS, x: point.x, y: point.y, scale: 1, opacity: 1 },
];

const toKeyframe = (frame: TimedFrame, totalMs: number): Keyframe => ({
  offset: Math.min(1, Math.max(0, frame.atMs / totalMs)),
  opacity: frame.opacity,
  transform: `translate(${frame.x}px, ${frame.y}px) scale(${frame.scale})`,
  easing: TRAVEL_EASE,
});

export const buildTourKeyframes = (
  start: { x: number; y: number },
  enterAtMs: number,
  travelMs: number,
  points: TourPoint[],
): { keyframes: Keyframe[]; totalMs: number } => {
  const hidden: TimedFrame = { atMs: 0, ...start, scale: 1, opacity: 0 };
  const frames: TimedFrame[] = [hidden, { ...hidden, atMs: enterAtMs }, { ...hidden, atMs: enterAtMs + FADE_IN_MS, opacity: 1 }];
  for (const point of points) frames.push(...stopFrames(point, frames[frames.length - 1], travelMs));
  const last = frames[frames.length - 1];
  const totalMs = last.atMs + TAIL_MS;
  frames.push({ ...last, atMs: totalMs });
  return { keyframes: frames.map((frame) => toKeyframe(frame, totalMs)), totalMs };
};
