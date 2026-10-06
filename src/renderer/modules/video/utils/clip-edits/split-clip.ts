import { newId } from "../id";
import type { BaseClip, Keyframe } from "../../types";

interface SplittableFields {
  inPoint?: number;
  speed?: number;
  fadeIn?: number;
  fadeOut?: number;
  keyframes?: Record<string, Keyframe[]>;
}

type SplittableClip = BaseClip & SplittableFields;

function shiftKeyframes(
  keyframes: Record<string, Keyframe[]>,
  offset: number,
): Record<string, Keyframe[]> {
  const shifted: Record<string, Keyframe[]> = {};
  for (const [prop, frames] of Object.entries(keyframes)) {
    shifted[prop] = frames.map((frame) => ({ ...frame, time: frame.time - offset }));
  }
  return shifted;
}

function buildTail(clip: SplittableClip, localTime: number): SplittableClip {
  const tail: SplittableClip = {
    ...clip,
    id: newId(),
    trackStart: clip.trackStart + localTime,
    duration: clip.duration - localTime,
  };
  if (clip.inPoint !== undefined) tail.inPoint = clip.inPoint + localTime * (clip.speed ?? 1);
  if (clip.fadeIn !== undefined) tail.fadeIn = 0;
  if (clip.keyframes) tail.keyframes = shiftKeyframes(clip.keyframes, localTime);
  return tail;
}

export function splitClip(clip: BaseClip, localTime: number): [BaseClip, BaseClip] {
  const source = clip as SplittableClip;
  const head: SplittableClip = { ...source, duration: localTime };
  if (source.fadeOut !== undefined) head.fadeOut = 0;
  return [head, buildTail(source, localTime)];
}
