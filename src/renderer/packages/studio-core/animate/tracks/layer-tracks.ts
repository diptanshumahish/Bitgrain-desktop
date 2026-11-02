import type { Layer } from "../../model/studio-types";
import type { PageAnimation, TrackGroupId, TrackKey } from "../../model/animation-types";
import { TRACK_GROUP_ORDER, TRACK_GROUP_PROPS } from "./track-groups";
import { frameStartTimes } from "./frame-timing";

export const frameKeys = (layer: Layer, animation: PageAnimation, starts: number[]): TrackKey[] =>
  animation.frames.map((frame, index) => ({
    id: frame.id,
    timeMs: starts[index],
    values: layer.anim?.[frame.id] ?? {},
    easing: frame.easing,
    bezier: frame.bezier,
  }));

export const hasExplicitTrack = (layer: Layer, group: TrackGroupId): boolean =>
  Array.isArray(layer.animTracks?.[group]);

export const effectiveTrack = (layer: Layer, animation: PageAnimation, group: TrackGroupId): TrackKey[] =>
  layer.animTracks?.[group] ?? frameKeys(layer, animation, frameStartTimes(animation));

const groupValues = (layer: Layer, key: TrackKey, group: TrackGroupId): Record<string, unknown> => {
  const base = layer as unknown as Record<string, unknown>;
  const values = key.values as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const prop of TRACK_GROUP_PROPS[group]) {
    const value = values[prop] ?? base[prop];
    if (value !== undefined) out[prop] = value;
  }
  return out;
};

export const isTrackVarying = (layer: Layer, keys: TrackKey[], group: TrackGroupId): boolean => {
  if (keys.length < 2) return false;
  const first = JSON.stringify(groupValues(layer, keys[0], group));
  return keys.some((key) => JSON.stringify(groupValues(layer, key, group)) !== first);
};

export const animatedGroups = (layer: Layer, animation: PageAnimation): TrackGroupId[] =>
  TRACK_GROUP_ORDER.filter(
    (group) =>
      hasExplicitTrack(layer, group) || isTrackVarying(layer, effectiveTrack(layer, animation, group), group),
  );
