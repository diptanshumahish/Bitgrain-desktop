import { ceilingOf, smoothingCoefficient } from "./envelope-shaping";

interface OnsetResult {
  pulse: Float32Array;
  onsets: Uint8Array;
}

const LOCAL_WINDOW_SECONDS = 0.25;
const MIN_GAP_SECONDS = 0.12;
const THRESHOLD_RATIO = 1.35;
const GLOBAL_FLOOR_RATIO = 0.2;
const PULSE_ATTACK_SECONDS = 0.02;
const PULSE_DECAY_SECONDS = 0.18;

const localMean = (flux: Float32Array, index: number, radius: number): number => {
  const first = Math.max(0, index - radius);
  const last = Math.min(flux.length - 1, index + radius);
  let total = 0;
  for (let cursor = first; cursor <= last; cursor++) total += flux[cursor];
  return total / (last - first + 1);
};

const isLocalPeak = (flux: Float32Array, index: number): boolean =>
  flux[index] >= (flux[index - 1] ?? 0) && flux[index] >= (flux[index + 1] ?? 0);

const pickOnsets = (flux: Float32Array, fps: number): Uint8Array => {
  const onsets = new Uint8Array(flux.length);
  const radius = Math.max(1, Math.round(LOCAL_WINDOW_SECONDS * fps));
  const minGap = Math.max(1, Math.round(MIN_GAP_SECONDS * fps));
  const floor = ceilingOf(flux) * GLOBAL_FLOOR_RATIO;
  let lastOnset = -minGap;
  for (let index = 0; index < flux.length; index++) {
    const threshold = Math.max(floor, localMean(flux, index, radius) * THRESHOLD_RATIO);
    if (flux[index] <= threshold || !isLocalPeak(flux, index) || index - lastOnset < minGap) continue;
    onsets[index] = 1;
    lastOnset = index;
  }
  return onsets;
};

const shapePulse = (flux: Float32Array, onsets: Uint8Array, fps: number): Float32Array => {
  const ceiling = ceilingOf(flux);
  const attack = smoothingCoefficient(PULSE_ATTACK_SECONDS, fps);
  const decay = Math.exp(-1 / (PULSE_DECAY_SECONDS * fps));
  const pulse = new Float32Array(flux.length);
  let level = 0;
  for (let index = 0; index < flux.length; index++) {
    const kick = onsets[index] ? Math.min(1, flux[index] / ceiling) : 0;
    const target = Math.max(kick, level * decay);
    level = target > level ? level + (target - level) * attack : target;
    pulse[index] = level;
  }
  return pulse;
};

export const detectOnsets = (flux: Float32Array, fps: number): OnsetResult => {
  const onsets = pickOnsets(flux, fps);
  return { pulse: shapePulse(flux, onsets, fps), onsets };
};
