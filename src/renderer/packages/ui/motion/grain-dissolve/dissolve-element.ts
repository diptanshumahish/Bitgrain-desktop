import { prefersReducedMotion } from "../shared/reduced-motion";
import { sampleElementGrain } from "./sample-element-grain";
import { animateGrain } from "./animate-grain";

export const dissolveElement = (element: HTMLElement | null): void => {
  if (!element || prefersReducedMotion()) return;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  animateGrain(rect, sampleElementGrain(element, rect));
};
