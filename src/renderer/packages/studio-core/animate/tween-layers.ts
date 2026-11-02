import type { Layer } from "../model/studio-types";
import type { PageAnimation } from "../model/animation-types";
import { TRACK_GROUP_ORDER, TRACK_GROUP_PROPS } from "./tracks/track-groups";
import { frameStartTimes, animationTotalDurationMs } from "./tracks/frame-timing";
import { sampleTrack, type SampleMode, type TrackClock, type TrackSample } from "./tracks/sample-track";
import { frameKeys } from "./tracks/layer-tracks";
import { applyGroupSample } from "./tracks/apply-group";

export { frameStartTimes, animationTotalDurationMs };

interface InterpolationContext {
  animation: PageAnimation;
  starts: number[];
  clock: TrackClock;
  poseFrameId: string | null;
}

const poseSample = (layer: Layer, frameId: string): TrackSample => {
  const values = layer.anim?.[frameId] ?? {};
  return { from: values, to: values, progress: 0 };
};

const frameSampleFor = (layer: Layer, context: InterpolationContext, timeMs: number): TrackSample | null =>
  context.poseFrameId
    ? poseSample(layer, context.poseFrameId)
    : sampleTrack(frameKeys(layer, context.animation, context.starts), timeMs, context.clock);

const interpolateLayerAt = (layer: Layer, context: InterpolationContext, timeMs: number): Layer => {
  const next = { ...layer } as unknown as Record<string, unknown>;
  const frameSample = frameSampleFor(layer, context, timeMs);
  for (const group of TRACK_GROUP_ORDER) {
    const explicit = layer.animTracks?.[group];
    const sample = explicit ? sampleTrack(explicit, timeMs, context.clock) : frameSample;
    if (sample) applyGroupSample(next, layer, TRACK_GROUP_PROPS[group], sample);
  }
  if (layer.type === "group" || layer.type === "frame") {
    next.layers = layer.layers.map((child) => interpolateLayerAt(child, context, timeMs));
  }
  return next as unknown as Layer;
};

const buildContext = (animation: PageAnimation, mode: SampleMode, poseFrameId: string | null): InterpolationContext => ({
  animation,
  starts: frameStartTimes(animation),
  clock: { totalMs: animationTotalDurationMs(animation), loop: animation.loop, mode },
  poseFrameId,
});

const wrapAnimationTime = (animation: PageAnimation, timeMs: number): number => {
  const total = animationTotalDurationMs(animation);
  if (total <= 0) return 0;
  if (animation.loop) return ((timeMs % total) + total) % total;
  return Math.min(Math.max(timeMs, 0), total);
};

const isAnimated = (animation: PageAnimation | undefined): animation is PageAnimation =>
  !!animation && animation.frames.length > 1;

export const interpolatePageLayers = (
  baseLayers: Layer[],
  animation: PageAnimation | undefined,
  timeMs: number,
): Layer[] => {
  if (!isAnimated(animation)) return baseLayers;
  const context = buildContext(animation, "playback", null);
  const time = wrapAnimationTime(animation, timeMs);
  return baseLayers.map((layer) => interpolateLayerAt(layer, context, time));
};

export const poseLayersAtTime = (baseLayers: Layer[], animation: PageAnimation, timeMs: number): Layer[] => {
  if (!isAnimated(animation)) return baseLayers;
  const context = buildContext(animation, "exact", null);
  const time = wrapAnimationTime(animation, timeMs);
  return baseLayers.map((layer) => interpolateLayerAt(layer, context, time));
};

export const resolveFrameLayers = (
  baseLayers: Layer[],
  frameId: string,
  animation?: PageAnimation,
): Layer[] => {
  const source = animation ?? { frames: [], loop: false, fps: 0 };
  const context = buildContext(source, "exact", frameId);
  const index = source.frames.findIndex((frame) => frame.id === frameId);
  const time = index >= 0 ? context.starts[index] : 0;
  return baseLayers.map((layer) => interpolateLayerAt(layer, context, time));
};

export const layerAtTime = (layer: Layer, animation: PageAnimation, timeMs: number): Layer => {
  const context = buildContext(animation, "exact", null);
  return interpolateLayerAt(layer, context, wrapAnimationTime(animation, timeMs));
};
