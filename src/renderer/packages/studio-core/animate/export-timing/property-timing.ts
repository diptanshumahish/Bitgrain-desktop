import type { Layer } from "../../model/studio-types";
import type { BezierCurve, PageAnimation, TrackGroupId, TrackKey } from "../../model/animation-types";
import { DEFAULT_ANIMATION_FPS } from "../../model/animation-types";
import { effectiveTrack, isTrackVarying } from "../tracks/layer-tracks";
import { animationTotalDurationMs } from "../tracks/frame-timing";
import { curveForEasing } from "../tracks/easing";

export type SegmentEase = { kind: "hold" } | { kind: "curve"; curve: BezierCurve };

export interface ExportTiming {
  timesMs: number[];
  eases: SegmentEase[];
}

const LINEAR: SegmentEase = { kind: "curve", curve: [0, 0, 1, 1] };
export const ANCESTOR_GEOMETRY_GROUPS: readonly TrackGroupId[] = ["position", "size", "layout"];
const MS_PER_SECOND = 1000;

const STATIC_TIMING: ExportTiming = { timesMs: [0], eases: [] };

const easeOf = (key: TrackKey): SegmentEase => {
  const curve = curveForEasing(key.easing, key.bezier);
  return curve ? { kind: "curve", curve } : { kind: "hold" };
};

const loopTiming = (keys: TrackKey[], totalMs: number): ExportTiming | null => {
  if (keys[0].timeMs !== 0) return null;
  const timesMs = keys.map((key) => key.timeMs);
  const eases = keys.slice(1).map(easeOf);
  if (keys[keys.length - 1].timeMs < totalMs) {
    timesMs.push(totalMs);
    eases.push(easeOf(keys[0]));
  }
  return { timesMs, eases };
};

const boundedTiming = (keys: TrackKey[], totalMs: number): ExportTiming => {
  const timesMs = keys.map((key) => key.timeMs);
  const eases = keys.slice(1).map(easeOf);
  if (timesMs[0] > 0) {
    timesMs.unshift(0);
    eases.unshift(LINEAR);
  }
  if (timesMs[timesMs.length - 1] < totalMs) {
    timesMs.push(totalMs);
    eases.push(LINEAR);
  }
  return { timesMs, eases };
};

const trackTiming = (keys: TrackKey[], animation: PageAnimation): ExportTiming | null => {
  const totalMs = animationTotalDurationMs(animation);
  if (keys.some((key) => key.timeMs < 0 || key.timeMs > totalMs)) return null;
  return animation.loop ? loopTiming(keys, totalMs) : boundedTiming(keys, totalMs);
};

const bakedTiming = (animation: PageAnimation, fps: number): ExportTiming => {
  const totalMs = animationTotalDurationMs(animation);
  const frameCount = Math.max(1, Math.round((totalMs / MS_PER_SECOND) * fps));
  const timesMs = Array.from({ length: frameCount + 1 }, (_, index) => (index / frameCount) * totalMs);
  return { timesMs, eases: timesMs.slice(1).map(() => LINEAR) };
};

const varyingTracks = (layer: Layer, groups: readonly TrackGroupId[], animation: PageAnimation): TrackKey[][] =>
  groups
    .map((group) => ({ group, keys: effectiveTrack(layer, animation, group) }))
    .filter(({ group, keys }) => isTrackVarying(layer, keys, group))
    .map(({ keys }) => keys);

export const propertyTiming = (
  chain: Layer[],
  ownGroups: readonly TrackGroupId[],
  animation: PageAnimation,
  ancestorGroups: readonly TrackGroupId[],
): ExportTiming => {
  const leaf = chain[chain.length - 1];
  const tracks = [
    ...varyingTracks(leaf, ownGroups, animation),
    ...chain.slice(0, -1).flatMap((ancestor) => varyingTracks(ancestor, ancestorGroups, animation)),
  ];
  if (tracks.length === 0) return STATIC_TIMING;
  const timings = tracks.map((keys) => trackTiming(keys, animation));
  const first = timings[0];
  const shared = first && timings.every((timing) => JSON.stringify(timing) === JSON.stringify(first));
  return shared ? first : bakedTiming(animation, animation.fps || DEFAULT_ANIMATION_FPS);
};
