import type { CssRule } from "../style/css-rules";
import type { Bounds } from "../geometry/subpath-bounds";

export interface Viewport {
  width: number;
  height: number;
}

interface SkipTracker {
  skip: (reason: string) => void;
  reasons: () => string[];
}

export interface WalkContext {
  ids: ReadonlyMap<string, Element>;
  rules: CssRule[];
  viewport: Viewport;
  skipped: SkipTracker;
  useDepth: number;
}

export interface LocalBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const createSkipTracker = (): SkipTracker => {
  const reasons: string[] = [];
  return {
    skip: (reason: string): void => {
      reasons.push(reason);
    },
    reasons: (): string[] => [...reasons],
  };
};

export const boundsToBox = (bounds: Bounds): LocalBox => ({
  x: bounds.minX,
  y: bounds.minY,
  width: Math.max(0, bounds.maxX - bounds.minX),
  height: Math.max(0, bounds.maxY - bounds.minY),
});

export const hrefOf = (element: Element): string | null =>
  element.getAttribute("href") ?? element.getAttribute("xlink:href");

export const referencedId = (value: string | null): string | null => {
  if (!value) return null;
  const match = /url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/.exec(value) ?? /^#(.+)$/.exec(value.trim());
  return match ? match[1] : null;
};
