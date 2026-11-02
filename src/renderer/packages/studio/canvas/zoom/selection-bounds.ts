import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { computeAbsoluteRect, type Rect } from "@bitgrain/studio-core/layers/frame-tree";

const unionRects = (first: Rect, second: Rect): Rect => {
  const x = Math.min(first.x, second.x);
  const y = Math.min(first.y, second.y);
  const right = Math.max(first.x + first.width, second.x + second.width);
  const bottom = Math.max(first.y + first.height, second.y + second.height);
  return { x, y, width: right - x, height: bottom - y };
};

export const selectionBounds = (pages: TemplatePage[], ids: string[]): Rect | null =>
  ids
    .map((id) => computeAbsoluteRect(pages, id))
    .filter((rect): rect is Rect => rect !== null)
    .reduce<Rect | null>((bounds, rect) => (bounds ? unionRects(bounds, rect) : rect), null);
