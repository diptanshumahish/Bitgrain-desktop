import { pageScrollIdleSignal, watchPageScrollIdle } from "./page-scroll-idle";
import { observeHover, observeVisibility } from "./element-observers";

const SLIDE_INTERVAL_MS = 2500;

interface AutoplayState {
  visible: boolean;
  hovered: boolean;
  timer: number | undefined;
}

const syncTimer = (state: AutoplayState, advance: () => void): void => {
  const shouldRun = state.visible && !state.hovered && pageScrollIdleSignal.value;
  if (shouldRun && state.timer === undefined) {
    state.timer = window.setInterval(advance, SLIDE_INTERVAL_MS);
  } else if (!shouldRun) {
    window.clearInterval(state.timer);
    state.timer = undefined;
  }
};

export const startSlideAutoplay = (card: HTMLElement, advance: () => void): (() => void) => {
  const state: AutoplayState = { visible: false, hovered: false, timer: undefined };
  const sync = (): void => syncTimer(state, advance);
  const cleanups = [
    observeVisibility(card, (visible) => { state.visible = visible; sync(); }),
    observeHover(card, (hovered) => { state.hovered = hovered; sync(); }),
    watchPageScrollIdle(),
    pageScrollIdleSignal.subscribe(sync),
  ];
  return () => {
    window.clearInterval(state.timer);
    cleanups.forEach((cleanup) => cleanup());
  };
};
