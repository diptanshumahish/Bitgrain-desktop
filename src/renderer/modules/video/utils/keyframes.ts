import type { Keyframe } from "../types";

export function interpolateKeyframes(
  keyframes: Keyframe[] | undefined,
  time: number,
  defaultValue: number,
): number {
  if (!keyframes || keyframes.length === 0) return defaultValue;
  
  // Sort keyframes by time
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  
  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];
    if (time >= k1.time && time < k2.time) {
      const t = (time - k1.time) / (k2.time - k1.time);
      return k1.value + (k2.value - k1.value) * t;
    }
  }
  
  return defaultValue;
}
