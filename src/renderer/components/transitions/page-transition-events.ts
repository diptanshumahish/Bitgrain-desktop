import type { MouseEvent } from "react";

export const PAGE_TRANSITION_EVENT = "bitgrain:page-transition";

export interface PageTransitionRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PageTransitionDetail {
  to: string;
  rect: PageTransitionRect;
}

export const triggerPageTransition = (to: string, rect: PageTransitionRect): void => {
  window.dispatchEvent(
    new CustomEvent<PageTransitionDetail>(PAGE_TRANSITION_EVENT, { detail: { to, rect } }),
  );
};

export const createTransitionClickHandler =
  (to: string) =>
  (event: MouseEvent): void => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    triggerPageTransition(to, {
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    });
  };
