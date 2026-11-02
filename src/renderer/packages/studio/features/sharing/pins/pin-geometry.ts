export interface PagePoint {
  x: number;
  y: number;
}

export const DRAFT_PIN_ID = "draft";
export const SURFACE_SELECTOR = "[data-comment-surface]";

const PERCENT = 100;

const clampUnit = (value: number): number => Math.min(Math.max(value, 0), 1);

export const pinSelector = (pinId: string): string => `[data-comment-pin="${pinId}"]`;

export const toPercent = (unit: number): string => `${unit * PERCENT}%`;

export const pointInSurface = (surface: Element, clientX: number, clientY: number): PagePoint => {
  const bounds = surface.getBoundingClientRect();
  return {
    x: clampUnit((clientX - bounds.left) / bounds.width),
    y: clampUnit((clientY - bounds.top) / bounds.height),
  };
};
