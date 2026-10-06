import type { EasingId, PageAnimation } from "../../../data/animation-types";
import { frameStartTimes, animationTotalDurationMs } from "../tween-layers";

export interface BezierHandle {
  x: number[];
  y: number[];
}

export interface StaticProp {
  a: 0;
  k: number | number[];
}

export interface Keyframe {
  t: number;
  s: number[];
  h?: number;
  o?: BezierHandle;
  i?: BezierHandle;
}

export interface AnimatedProp {
  a: 1;
  k: Keyframe[];
}

export type LottieProp = StaticProp | AnimatedProp;

export interface Timeline {
  fps: number;
  frameNumbers: number[];
  segmentEasings: EasingId[];
  outPoint: number;
  stateCount: number;
}

const EASE_BEZIER: Record<EasingId, { o: BezierHandle; i: BezierHandle }> = {
  linear: { o: { x: [0], y: [0] }, i: { x: [1], y: [1] } },
  "ease-in": { o: { x: [0.42], y: [0] }, i: { x: [1], y: [1] } },
  "ease-out": { o: { x: [0], y: [0] }, i: { x: [0.58], y: [1] } },
  "ease-in-out": { o: { x: [0.42], y: [0] }, i: { x: [0.58], y: [1] } },
  spring: { o: { x: [0.34], y: [1.56] }, i: { x: [0.64], y: [1] } },
  hold: { o: { x: [0], y: [0] }, i: { x: [1], y: [1] } },
};

const toFrame = (timeMs: number, fps: number): number => Math.round((timeMs / 1000) * fps);

export const buildTimeline = (animation: PageAnimation): Timeline => {
  const fps = animation.fps || 30;
  const startsMs = frameStartTimes(animation);
  const totalMs = animationTotalDurationMs(animation);
  if (animation.loop) startsMs.push(totalMs);
  const frameNumbers = startsMs.map((timeMs) => toFrame(timeMs, fps));

  const frames = animation.frames;
  const segmentEasings: EasingId[] = [];
  for (let index = 0; index < frames.length - 1; index += 1) {
    segmentEasings.push(frames[index + 1].easing);
  }
  if (animation.loop && frames.length > 1) segmentEasings.push(frames[0].easing);

  return {
    fps,
    frameNumbers,
    segmentEasings,
    outPoint: Math.max(1, toFrame(totalMs, fps)),
    stateCount: frameNumbers.length,
  };
};

const tuplesEqual = (states: number[][]): boolean =>
  states.every((state) => state.every((value, index) => value === states[0][index]));

export const keyframed = (states: number[][], timeline: Timeline): LottieProp => {
  if (states.length === 0) return { a: 0, k: 0 };
  if (states.length === 1 || tuplesEqual(states)) {
    const first = states[0];
    return { a: 0, k: first.length === 1 ? first[0] : first };
  }

  const keys: Keyframe[] = states.map((state, index) => {
    const isLast = index === states.length - 1;
    const keyframe: Keyframe = { t: timeline.frameNumbers[index], s: state.slice() };
    if (isLast) return keyframe;
    const easing = timeline.segmentEasings[index] ?? "linear";
    if (easing === "hold") {
      keyframe.h = 1;
    } else {
      const bezier = EASE_BEZIER[easing];
      keyframe.o = bezier.o;
      keyframe.i = bezier.i;
    }
    return keyframe;
  });

  return { a: 1, k: keys };
};

export const scalarKeyframed = (values: number[], timeline: Timeline): LottieProp =>
  keyframed(values.map((value) => [value]), timeline);

export const colorToRgb = (input: string): number[] => {
  const value = input.trim();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const full = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
    const num = parseInt(full, 16);
    if (!Number.isNaN(num) && (hex.length === 3 || hex.length === 6)) {
      return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
    }
  }
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (match) {
    const parts = match[1].split(",").map((part) => parseFloat(part));
    if (parts.length >= 3) return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
  }
  return [0, 0, 0];
};
