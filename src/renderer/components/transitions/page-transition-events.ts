import type { MouseEvent } from "react";
import { preloadRoute } from "./route-preloaders";

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

export const createPreloadHandler =
  (to: string) =>
  (): void => {
    preloadRoute(to);
  };

// Desktop: no PageTransitionPortal is mounted to finish the web's animated route
// change, so the click is left alone and the Link navigates normally (the home
// surface turns editor paths into new tabs).
export const createTransitionClickHandler =
  (_to: string) =>
  (_event: MouseEvent): void => {};
