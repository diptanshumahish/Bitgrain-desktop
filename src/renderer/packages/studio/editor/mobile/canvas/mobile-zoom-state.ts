import { signal } from "@bitgrain/core/signal";

const MOBILE_ZOOM_MIN = 0.5;
const MOBILE_ZOOM_MAX = 5;
export const MOBILE_ZOOM_FIT = 1;
const FALLBACK_FIT_SCALE = 0.2;

export const mobileZoomSignal = signal<number>(MOBILE_ZOOM_FIT);
export const mobileFitScaleSignal = signal<number>(FALLBACK_FIT_SCALE);

export const clampMobileZoom = (zoom: number): number =>
  Math.min(MOBILE_ZOOM_MAX, Math.max(MOBILE_ZOOM_MIN, zoom));

export const resetMobileZoom = (): void => {
  mobileZoomSignal.value = MOBILE_ZOOM_FIT;
};

export const updateFitScale = (next: number): void => {
  mobileFitScaleSignal.value = next > 0 ? next : FALLBACK_FIT_SCALE;
};
