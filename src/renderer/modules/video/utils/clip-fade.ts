import { CLIP_FADE_MAX_SECONDS } from "../constants";

export function maxFadeForClip(clipDuration: number): number {
  return Math.min(CLIP_FADE_MAX_SECONDS, Math.max(0, clipDuration / 2));
}

export function clampFade(value: number, clipDuration: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(maxFadeForClip(clipDuration), value));
}

export function clipFadeAlpha(
  clipDuration: number,
  localTime: number,
  fadeIn: number = 0,
  fadeOut: number = 0,
): number {
  if (localTime < 0 || localTime > clipDuration) return 0;
  let alpha = 1;
  if (fadeIn > 0 && localTime < fadeIn) {
    alpha = Math.min(alpha, localTime / fadeIn);
  }
  if (fadeOut > 0) {
    const tail = clipDuration - localTime;
    if (tail < fadeOut) {
      alpha = Math.min(alpha, Math.max(0, tail / fadeOut));
    }
  }
  return alpha;
}
