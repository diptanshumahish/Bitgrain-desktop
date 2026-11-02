import type { PageAnimation } from "../../model/animation-types";

export const frameStartTimes = (animation: PageAnimation): number[] => {
  const times = [0];
  let accumulated = 0;
  for (let index = 1; index < animation.frames.length; index += 1) {
    accumulated += Math.max(1, animation.frames[index].durationMs);
    times.push(accumulated);
  }
  return times;
};

export const animationTotalDurationMs = (animation: PageAnimation): number => {
  const frames = animation.frames;
  if (frames.length < 2) return 0;
  const starts = frameStartTimes(animation);
  const last = starts[starts.length - 1];
  return animation.loop ? last + Math.max(1, frames[0].durationMs) : last;
};

export const frameStartTime = (animation: PageAnimation, frameId: string): number | null => {
  const index = animation.frames.findIndex((frame) => frame.id === frameId);
  return index < 0 ? null : frameStartTimes(animation)[index];
};
