const SETTLE_DELAY_MS = 160;

const settleTimers = new WeakMap<HTMLElement, number>();

export const markZooming = (element: HTMLElement): void => {
  element.style.willChange = "transform";
  window.clearTimeout(settleTimers.get(element));
  const timer = window.setTimeout(() => {
    element.style.willChange = "auto";
  }, SETTLE_DELAY_MS);
  settleTimers.set(element, timer);
};
