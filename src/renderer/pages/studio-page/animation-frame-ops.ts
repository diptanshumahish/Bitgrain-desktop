import type { Layer, TemplatePage } from "../../data/studioTypes";
import type {
  AnimationFrameMeta,
  EasingId,
  LayerAnimState,
  PageAnimation,
} from "../../data/animation-types";
import {
  DEFAULT_ANIMATION_FPS,
  DEFAULT_FRAME_DURATION_MS,
  NUMERIC_PROPS,
  COLOR_PROPS,
  STEP_PROPS,
  BOOL_PROPS,
  OBJECT_PROPS,
} from "../../data/animation-types";

export const makeFrameId = (): string =>
  `frame-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const mapLayersDeep = (layers: Layer[], fn: (layer: Layer) => Layer): Layer[] =>
  layers.map((layer) => {
    const mapped = fn(layer);
    if (mapped.type === "group" || mapped.type === "frame") {
      return { ...mapped, layers: mapLayersDeep(mapped.layers, fn) };
    }
    return mapped;
  });

const stripFrameFromLayers = (layers: Layer[], frameId: string): Layer[] =>
  mapLayersDeep(layers, (layer) => {
    if (!layer.anim || !(frameId in layer.anim)) return layer;
    const anim = { ...layer.anim };
    delete anim[frameId];
    return { ...layer, anim };
  });

const copyFrameInLayers = (
  layers: Layer[],
  sourceId: string,
  targetId: string,
): Layer[] =>
  mapLayersDeep(layers, (layer) => {
    const source = layer.anim?.[sourceId];
    if (!source) return layer;
    return { ...layer, anim: { ...layer.anim, [targetId]: { ...source } } };
  });

export const enableAnimation = (page: TemplatePage, frameId: string): TemplatePage => {
  if (page.animation) return page;
  const animation: PageAnimation = {
    frames: [{ id: frameId, durationMs: DEFAULT_FRAME_DURATION_MS, easing: "ease-in-out" }],
    loop: true,
    fps: DEFAULT_ANIMATION_FPS,
  };
  return { ...page, animation };
};

export const addFrame = (page: TemplatePage, newFrameId: string): TemplatePage => {
  if (!page.animation) return page;
  const frames = page.animation.frames;
  const source = frames[frames.length - 1];
  const newFrame: AnimationFrameMeta = {
    id: newFrameId,
    durationMs: DEFAULT_FRAME_DURATION_MS,
    easing: "ease-in-out",
  };
  const layers = copyFrameInLayers(page.layers, source.id, newFrame.id);
  return {
    ...page,
    layers,
    animation: { ...page.animation, frames: [...frames, newFrame] },
  };
};

export const deleteFrame = (page: TemplatePage, frameId: string): TemplatePage => {
  if (!page.animation || page.animation.frames.length <= 1) return page;
  const frames = page.animation.frames.filter((frame) => frame.id !== frameId);
  const layers = stripFrameFromLayers(page.layers, frameId);
  return { ...page, layers, animation: { ...page.animation, frames } };
};

export const setFrameTiming = (
  page: TemplatePage,
  frameId: string,
  patch: { durationMs?: number; easing?: EasingId },
): TemplatePage => {
  if (!page.animation) return page;
  const frames = page.animation.frames.map((frame) =>
    frame.id === frameId ? { ...frame, ...patch } : frame,
  );
  return { ...page, animation: { ...page.animation, frames } };
};

export const setAnimationLoop = (page: TemplatePage, loop: boolean): TemplatePage => {
  if (!page.animation) return page;
  return { ...page, animation: { ...page.animation, loop } };
};

export const setAnimationFps = (page: TemplatePage, fps: number): TemplatePage => {
  if (!page.animation) return page;
  return { ...page, animation: { ...page.animation, fps } };
};

export const captureFramePose = (
  page: TemplatePage,
  frameId: string,
  poseLayers: Layer[],
): TemplatePage => {
  const poseById = new Map<string, Layer>();
  const index = (layers: Layer[]): void => {
    for (const layer of layers) {
      poseById.set(layer.id, layer);
      if (layer.type === "group" || layer.type === "frame") index(layer.layers);
    }
  };
  index(poseLayers);

  const layers = mapLayersDeep(page.layers, (layer) => {
    const pose = poseById.get(layer.id);
    if (!pose) return layer;
    const source = pose as unknown as Record<string, unknown>;
    const state: Record<string, unknown> = {};
    for (const prop of NUMERIC_PROPS) {
      const value = source[prop];
      if (typeof value === "number") state[prop] = value;
    }
    for (const prop of COLOR_PROPS) {
      const value = source[prop];
      if (typeof value === "string") state[prop] = value;
    }
    for (const prop of STEP_PROPS) {
      const value = source[prop];
      if (typeof value === "string") state[prop] = value;
    }
    for (const prop of BOOL_PROPS) {
      const value = source[prop];
      if (typeof value === "boolean") state[prop] = value;
    }
    if (pose.type === "vector") state.path = pose.path;
    const existing = (layer.anim?.[frameId] ?? {}) as Record<string, unknown>;
    const preserved: Record<string, unknown> = {};
    for (const prop of OBJECT_PROPS) {
      if (prop in existing) preserved[prop] = existing[prop];
    }
    return {
      ...layer,
      anim: { ...(layer.anim ?? {}), [frameId]: { ...preserved, ...state } as LayerAnimState },
    };
  });
  return { ...page, layers };
};

export const setLayerFrameOverride = (
  page: TemplatePage,
  frameId: string,
  layerId: string,
  patch: LayerAnimState,
): TemplatePage => {
  const layers = mapLayersDeep(page.layers, (layer) => {
    if (layer.id !== layerId) return layer;
    const anim = { ...(layer.anim ?? {}) };
    anim[frameId] = { ...(anim[frameId] ?? {}), ...patch };
    return { ...layer, anim };
  });
  return { ...page, layers };
};
