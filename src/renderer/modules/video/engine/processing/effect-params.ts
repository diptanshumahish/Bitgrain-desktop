import type { TransformMode } from "../../../../engine/types";
import type { EffectParams, Keyframe } from "../../types";
import type { ActiveEffect } from "../frame-source";
import { interpolateKeyframes } from "../../utils/keyframes";

export interface MergedEffects {
  modes: TransformMode[];
  params: EffectParams;
}

export function applyKeyframes(
  params: EffectParams,
  keyframes: Record<string, Keyframe[]> | undefined,
  localTime: number,
): EffectParams {
  if (!keyframes) return params;
  const resolved: Record<string, unknown> = { ...params };
  for (const [prop, frames] of Object.entries(keyframes)) {
    if (frames.length === 0) continue;
    const base = resolved[prop];
    const fallback = typeof base === "number" ? base : frames[0].value;
    resolved[prop] = interpolateKeyframes(frames, localTime, fallback);
  }
  return resolved as EffectParams;
}

export function mergeEffectParams(activeEffects: ActiveEffect[], time: number): MergedEffects {
  const modes: TransformMode[] = [];
  const params: EffectParams = {};
  for (const { effect, trackStart, keyframes } of activeEffects) {
    if (effect.mode !== "transform") modes.push(effect.mode);
    Object.assign(params, applyKeyframes(effect.params, keyframes, time - trackStart));
  }
  return { modes, params };
}
