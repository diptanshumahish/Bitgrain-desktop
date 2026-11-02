import type { Layer, TemplatePage } from "../../model/studio-types";
import type {
  BezierCurve,
  EasingId,
  LayerAnimState,
  PageAnimation,
  TrackGroupId,
  TrackKey,
} from "../../model/animation-types";
import { TRACK_GROUP_PROPS } from "./track-groups";
import { frameKeys } from "./layer-tracks";
import { frameStartTimes, animationTotalDurationMs } from "./frame-timing";
import { layerAtTime } from "../tween-layers";

type KeysUpdater = (keys: TrackKey[], layer: Layer, animation: PageAnimation) => TrackKey[];

const DEFAULT_KEY_EASING: EasingId = "ease-in-out";

export const makeTrackKeyId = (): string => `key-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const pickGroupValues = (values: Record<string, unknown>, group: TrackGroupId): LayerAnimState => {
  const out: Record<string, unknown> = {};
  for (const prop of TRACK_GROUP_PROPS[group]) {
    if (values[prop] !== undefined) out[prop] = values[prop];
  }
  return out as LayerAnimState;
};

export const sortKeys = (keys: TrackKey[]): TrackKey[] => [...keys].sort((first, second) => first.timeMs - second.timeMs);

const materializeTrack = (layer: Layer, animation: PageAnimation, group: TrackGroupId): TrackKey[] =>
  layer.animTracks?.[group] ??
  frameKeys(layer, animation, frameStartTimes(animation)).map((key) => ({
    ...key,
    values: pickGroupValues(key.values as Record<string, unknown>, group),
  }));

const mapLayerById = (layers: Layer[], layerId: string, update: (layer: Layer) => Layer): Layer[] =>
  layers.map((layer) => {
    if (layer.id === layerId) return update(layer);
    if (layer.type === "group" || layer.type === "frame") {
      return { ...layer, layers: mapLayerById(layer.layers, layerId, update) } as Layer;
    }
    return layer;
  });

const updateTrack = (page: TemplatePage, layerId: string, group: TrackGroupId, updater: KeysUpdater): TemplatePage => {
  const animation = page.animation;
  if (!animation) return page;
  const layers = mapLayerById(page.layers, layerId, (layer) => {
    const keys = sortKeys(updater(materializeTrack(layer, animation, group), layer, animation));
    return { ...layer, animTracks: { ...(layer.animTracks ?? {}), [group]: keys } };
  });
  return { ...page, layers };
};

const clampTime = (animation: PageAnimation, timeMs: number): number =>
  Math.round(Math.min(Math.max(timeMs, 0), animationTotalDurationMs(animation)));

export const moveTrackKey = (
  page: TemplatePage,
  layerId: string,
  group: TrackGroupId,
  keyId: string,
  timeMs: number,
): TemplatePage =>
  updateTrack(page, layerId, group, (keys, _layer, animation) =>
    keys.map((key) => (key.id === keyId ? { ...key, timeMs: clampTime(animation, timeMs) } : key)),
  );

export const setTrackKeyEasing = (
  page: TemplatePage,
  layerId: string,
  group: TrackGroupId,
  keyId: string,
  easing: EasingId,
  bezier: BezierCurve | undefined,
): TemplatePage =>
  updateTrack(page, layerId, group, (keys) =>
    keys.map((key) => (key.id === keyId ? { ...key, easing, bezier } : key)),
  );

const nextKeyEasing = (keys: TrackKey[], timeMs: number): EasingId =>
  keys.find((key) => key.timeMs > timeMs)?.easing ?? DEFAULT_KEY_EASING;

export const addTrackKey = (
  page: TemplatePage,
  layerId: string,
  group: TrackGroupId,
  timeMs: number,
  keyId: string,
): TemplatePage =>
  updateTrack(page, layerId, group, (keys, layer, animation) => {
    const time = clampTime(animation, timeMs);
    const sampled = layerAtTime({ ...layer, animTracks: { ...layer.animTracks, [group]: keys } }, animation, time);
    const values = pickGroupValues(sampled as unknown as Record<string, unknown>, group);
    return [...keys, { id: keyId, timeMs: time, values, easing: nextKeyEasing(keys, time) }];
  });

export const removeTrackKey = (
  page: TemplatePage,
  layerId: string,
  group: TrackGroupId,
  keyId: string,
): TemplatePage =>
  updateTrack(page, layerId, group, (keys) => (keys.length <= 1 ? keys : keys.filter((key) => key.id !== keyId)));

export const resetTrack = (page: TemplatePage, layerId: string, group: TrackGroupId): TemplatePage => ({
  ...page,
  layers: mapLayerById(page.layers, layerId, (layer) => {
    const animTracks = { ...(layer.animTracks ?? {}) };
    delete animTracks[group];
    return { ...layer, animTracks };
  }),
});
