import { setSignal, signal } from "../../../../lib/signal";

const SCROLL_IDLE_MS = 2000;

export const pageScrollIdleSignal = signal(false);

let idleTimer: number | undefined;
let watcherCount = 0;

const markScrolling = (): void => {
  setSignal(pageScrollIdleSignal, false);
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => setSignal(pageScrollIdleSignal, true), SCROLL_IDLE_MS);
};

const stopWatching = (): void => {
  watcherCount -= 1;
  if (watcherCount > 0) return;
  window.removeEventListener("scroll", markScrolling);
  window.clearTimeout(idleTimer);
  setSignal(pageScrollIdleSignal, false);
};

export const watchPageScrollIdle = (): (() => void) => {
  watcherCount += 1;
  if (watcherCount === 1) {
    window.addEventListener("scroll", markScrolling, { passive: true });
    markScrolling();
  }
  return stopWatching;
};
