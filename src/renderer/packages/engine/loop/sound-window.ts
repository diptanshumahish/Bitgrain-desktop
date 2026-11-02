export const clampWindowStart = (startSeconds: number, duration: number, seconds: number): number =>
  Math.min(Math.max(0, duration - seconds), Math.max(0, startSeconds));

const windowSum = (peaks: readonly number[], first: number, span: number): number => {
  let total = 0;
  for (let index = first; index < first + span; index++) total += peaks[index] ?? 0;
  return total;
};

export const loudestWindowStart = (peaks: readonly number[], duration: number, seconds: number): number => {
  if (duration <= seconds || peaks.length === 0) return 0;
  const secondsPerPeak = duration / peaks.length;
  const span = Math.max(1, Math.round(seconds / secondsPerPeak));
  let total = windowSum(peaks, 0, span);
  let best = total;
  let bestFirst = 0;
  for (let first = 1; first + span <= peaks.length; first++) {
    total += peaks[first + span - 1] - peaks[first - 1];
    if (total <= best) continue;
    best = total;
    bestFirst = first;
  }
  return clampWindowStart(bestFirst * secondsPerPeak, duration, seconds);
};
