import type { LayerAnimState, TrackKey } from "../../model/animation-types";
import { easeProgress } from "./easing";

export type SampleMode = "playback" | "exact";

export interface TrackClock {
  totalMs: number;
  loop: boolean;
  mode: SampleMode;
}

export interface TrackSample {
  from: LayerAnimState;
  to: LayerAnimState;
  progress: number;
}

const KEY_TIME_EPSILON = 1e-6;

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

const constant = (key: TrackKey): TrackSample => ({ from: key.values, to: key.values, progress: 0 });

const segment = (from: TrackKey, to: TrackKey, elapsedMs: number, spanMs: number): TrackSample => ({
  from: from.values,
  to: to.values,
  progress: easeProgress(to.easing, to.bezier, clamp01(elapsedMs / Math.max(1, spanMs))),
});

const sampleLoopWrap = (keys: TrackKey[], timeMs: number, totalMs: number): TrackSample => {
  const first = keys[0];
  const last = keys[keys.length - 1];
  const spanMs = first.timeMs + totalMs - last.timeMs;
  const elapsedMs = timeMs >= last.timeMs ? timeMs - last.timeMs : timeMs + totalMs - last.timeMs;
  return segment(last, first, elapsedMs, spanMs);
};

const findSegmentIndex = (keys: TrackKey[], timeMs: number): number => {
  for (let index = keys.length - 2; index >= 0; index -= 1) {
    if (keys[index].timeMs <= timeMs) return index;
  }
  return 0;
};

const findExactKey = (keys: TrackKey[], timeMs: number): TrackKey | undefined =>
  keys.find((key) => Math.abs(key.timeMs - timeMs) < KEY_TIME_EPSILON);

const sampleBounded = (keys: TrackKey[], timeMs: number): TrackSample => {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (timeMs <= first.timeMs) return segment(first, keys[1], 0, 1);
  if (timeMs > last.timeMs) return constant(last);
  const index = findSegmentIndex(keys, timeMs);
  const from = keys[index];
  const to = keys[index + 1];
  return segment(from, to, timeMs - from.timeMs, to.timeMs - from.timeMs);
};

export const sampleTrack = (keys: TrackKey[], timeMs: number, clock: TrackClock): TrackSample | null => {
  if (keys.length === 0) return null;
  if (keys.length === 1) return constant(keys[0]);
  if (clock.mode === "exact") {
    const exact = findExactKey(keys, timeMs);
    if (exact) return constant(exact);
  }
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (clock.loop && clock.totalMs > 0 && (timeMs < first.timeMs || timeMs >= last.timeMs)) {
    return sampleLoopWrap(keys, timeMs, clock.totalMs);
  }
  return sampleBounded(keys, timeMs);
};
