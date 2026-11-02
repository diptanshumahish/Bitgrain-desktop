import type { PageAnimation } from "../../model/animation-types";
import { DEFAULT_ANIMATION_FPS } from "../../model/animation-types";
import { animationTotalDurationMs } from "../tween-layers";
import type { ExportTiming, SegmentEase } from "../export-timing/property-timing";

interface BezierHandle {
  x: number[];
  y: number[];
}

interface StaticProp {
  a: 0;
  k: unknown;
}

interface Keyframe {
  t: number;
  s: unknown[];
  h?: number;
  o?: BezierHandle;
  i?: BezierHandle;
}

interface AnimatedProp {
  a: 1;
  k: Keyframe[];
}

export type LottieProp = StaticProp | AnimatedProp;

export interface Timeline {
  fps: number;
  outPoint: number;
}

export interface LottieTiming {
  timesMs: number[];
  frameNumbers: number[];
  eases: SegmentEase[];
}

const MS_PER_SECOND = 1000;

const toFrame = (timeMs: number, fps: number): number => Math.round((timeMs / MS_PER_SECOND) * fps);

export const buildTimeline = (animation: PageAnimation): Timeline => {
  const fps = animation.fps || DEFAULT_ANIMATION_FPS;
  return { fps, outPoint: Math.max(1, toFrame(animationTotalDurationMs(animation), fps)) };
};

export const toLottieTiming = (timing: ExportTiming, timeline: Timeline): LottieTiming => {
  const out: LottieTiming = { timesMs: [], frameNumbers: [], eases: [] };
  timing.timesMs.forEach((timeMs, index) => {
    const frame = toFrame(timeMs, timeline.fps);
    const previous = out.frameNumbers[out.frameNumbers.length - 1];
    if (previous !== undefined && frame <= previous) return;
    out.timesMs.push(timeMs);
    out.frameNumbers.push(frame);
    if (index > 0) out.eases.push(timing.eases[index - 1]);
  });
  return out;
};

const applyEase = (keyframe: Keyframe, ease: SegmentEase | undefined): void => {
  if (!ease) return;
  if (ease.kind === "hold") {
    keyframe.h = 1;
    return;
  }
  const [x1, y1, x2, y2] = ease.curve;
  keyframe.o = { x: [x1], y: [y1] };
  keyframe.i = { x: [x2], y: [y2] };
};

const allEqual = (states: unknown[]): boolean => {
  const first = JSON.stringify(states[0]);
  return states.every((state) => JSON.stringify(state) === first);
};

export const keyframedValues = (states: unknown[], timing: LottieTiming, toStatic: (state: unknown) => unknown, toKey: (state: unknown) => unknown[]): LottieProp => {
  if (states.length === 0) return { a: 0, k: 0 };
  if (states.length === 1 || allEqual(states)) return { a: 0, k: toStatic(states[0]) };
  const keys = states.map((state, index) => {
    const keyframe: Keyframe = { t: timing.frameNumbers[index], s: toKey(state) };
    if (index < states.length - 1) applyEase(keyframe, timing.eases[index]);
    return keyframe;
  });
  return { a: 1, k: keys };
};

export const keyframed = (states: number[][], timing: LottieTiming): LottieProp =>
  keyframedValues(
    states,
    timing,
    (state) => {
      const tuple = state as number[];
      return tuple.length === 1 ? tuple[0] : tuple;
    },
    (state) => (state as number[]).slice(),
  );

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
