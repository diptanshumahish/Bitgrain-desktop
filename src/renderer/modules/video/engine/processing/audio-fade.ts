import type { AudioSource } from "../audio-sources";

type FadeSource = Pick<AudioSource, "volume" | "duration" | "fadeIn" | "fadeOut">;

function envelopeAt(src: FadeSource, localTime: number): number {
  let level = 1;
  if (src.fadeIn > 0 && localTime < src.fadeIn) level = Math.min(level, localTime / src.fadeIn);
  const tail = src.duration - localTime;
  if (src.fadeOut > 0 && tail < src.fadeOut) level = Math.min(level, tail / src.fadeOut);
  return src.volume * Math.max(0, level);
}

export function scheduleFadeEnvelope(
  param: AudioParam,
  src: FadeSource,
  clipZeroAt: number,
  fromLocal: number,
): void {
  const start = Math.max(0, fromLocal);
  const at = (localTime: number): number => Math.max(0, clipZeroAt + localTime);
  const fadeOutStart = src.duration - src.fadeOut;
  param.setValueAtTime(envelopeAt(src, start), at(start));
  if (src.fadeIn > 0 && start < src.fadeIn) {
    param.linearRampToValueAtTime(src.volume, at(src.fadeIn));
  }
  if (src.fadeOut <= 0) return;
  if (start < fadeOutStart) param.setValueAtTime(src.volume, at(fadeOutStart));
  param.linearRampToValueAtTime(0, at(src.duration));
}
