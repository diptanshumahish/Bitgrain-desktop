import type { PaintStop } from "@bitgrain/studio-core/model/paint-types";
import { resolveStops } from "@bitgrain/studio-core/shape-render/paint/gradient-stops";

const PERCENT = 100;

export const gradientStripCss = (stops: PaintStop[]): string => {
  const parts = resolveStops(stops).map(({ rgba, pos }) => {
    const color = `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`;
    return `${color} ${Math.round(pos * PERCENT)}%`;
  });
  return `linear-gradient(90deg, ${parts.join(", ")})`;
};
