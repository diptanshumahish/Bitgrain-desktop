import { prefersReducedMotion } from "../shared/reduced-motion";

const STRETCH_FACTOR = 2.4;
const SETTLE_CLASSES = ["transition-transform", "duration-500", "ease-[cubic-bezier(0.22,1.35,0.4,1)]"];

export const stretchElement = (target: HTMLElement | null, excessPx: number, trackWidth: number): void => {
  if (!target || trackWidth <= 0 || prefersReducedMotion()) return;
  target.classList.remove(...SETTLE_CLASSES);
  target.style.transformOrigin = excessPx < 0 ? "right" : "left";
  target.style.transform = excessPx === 0 ? "" : `scaleX(${1 + (Math.sqrt(Math.abs(excessPx)) * STRETCH_FACTOR) / trackWidth})`;
};

export const releaseStretch = (target: HTMLElement | null): void => {
  if (!target) return;
  target.classList.add(...SETTLE_CLASSES);
  target.style.transform = "";
};
