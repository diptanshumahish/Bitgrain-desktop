import type { Layer } from "../../model/studio-types";
import type { PageAnimation, TrackGroupId, TrackKey } from "../../model/animation-types";
import { TRACK_GROUP_ORDER, TRACK_GROUP_PROPS } from "./track-groups";
import { frameStartTime } from "./frame-timing";
import { makeTrackKeyId, pickGroupValues, sortKeys } from "./track-ops";
import { layerAtTime } from "../tween-layers";

const KEY_TIME_EPSILON = 0.5;

const changedProps = (
  group: TrackGroupId,
  patch: Record<string, unknown>,
  current: Record<string, unknown>,
): string[] =>
  TRACK_GROUP_PROPS[group].filter(
    (prop) => patch[prop] !== undefined && JSON.stringify(patch[prop]) !== JSON.stringify(current[prop]),
  );

const upsertKey = (
  keys: TrackKey[],
  timeMs: number,
  values: Record<string, unknown>,
  fallback: Omit<TrackKey, "id" | "timeMs" | "values">,
): TrackKey[] => {
  const existing = keys.find((key) => Math.abs(key.timeMs - timeMs) < KEY_TIME_EPSILON);
  if (existing) {
    return keys.map((key) => (key === existing ? { ...key, values: { ...key.values, ...values } } : key));
  }
  return sortKeys([...keys, { id: makeTrackKeyId(), timeMs, values, ...fallback }]);
};

export const syncTracksWithPose = (
  layer: Layer,
  animation: PageAnimation,
  frameId: string,
  patch: Record<string, unknown>,
): Layer => {
  const timeMs = frameStartTime(animation, frameId);
  const frame = animation.frames.find((candidate) => candidate.id === frameId);
  if (timeMs === null || !frame || !layer.animTracks) return layer;
  const current = layerAtTime(layer, animation, timeMs) as unknown as Record<string, unknown>;
  const animTracks = { ...layer.animTracks };
  for (const group of TRACK_GROUP_ORDER) {
    const keys = animTracks[group];
    if (!keys) continue;
    const changed = changedProps(group, patch, current);
    if (changed.length === 0) continue;
    const values = { ...pickGroupValues(current, group), ...Object.fromEntries(changed.map((prop) => [prop, patch[prop]])) };
    animTracks[group] = upsertKey(keys, timeMs, values, { easing: frame.easing, bezier: frame.bezier });
  }
  return { ...layer, animTracks };
};
