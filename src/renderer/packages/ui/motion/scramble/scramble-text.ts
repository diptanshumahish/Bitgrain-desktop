import { prefersReducedMotion } from "../shared/reduced-motion";

const SCRAMBLE_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789#%&*+=";
const SCRAMBLE_DURATION_MS = 420;
const ORDERED_SHARE = 0.75;

const runningFrames = new WeakMap<HTMLElement, number>();

const randomGlyph = (): string => SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];

const planSettleTimes = (target: string): number[] =>
  target
    .split("")
    .map((_, index) => (index / target.length) * SCRAMBLE_DURATION_MS * ORDERED_SHARE + Math.random() * SCRAMBLE_DURATION_MS * (1 - ORDERED_SHARE));

const textAt = (target: string, settleTimes: number[], elapsed: number): string =>
  target
    .split("")
    .map((char, index) => (char === " " || elapsed >= settleTimes[index] ? char : randomGlyph()))
    .join("");

export const scrambleText = (element: HTMLElement, target: string): void => {
  cancelAnimationFrame(runningFrames.get(element) ?? 0);
  if (prefersReducedMotion()) {
    element.textContent = target;
    return;
  }
  const settleTimes = planSettleTimes(target);
  const startTime = performance.now();
  const step = (now: number): void => {
    const elapsed = now - startTime;
    if (elapsed >= SCRAMBLE_DURATION_MS) {
      element.textContent = target;
      runningFrames.delete(element);
      return;
    }
    element.textContent = textAt(target, settleTimes, elapsed);
    runningFrames.set(element, requestAnimationFrame(step));
  };
  runningFrames.set(element, requestAnimationFrame(step));
};
