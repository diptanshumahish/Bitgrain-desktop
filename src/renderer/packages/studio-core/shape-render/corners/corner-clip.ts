import { cornerPathD, hasCustomCorners, type CornerLayer } from "./corner-style";
import type { BoxRect } from "../geometry/corner-path";

export const clipToCorners = (ctx: CanvasRenderingContext2D, layer: CornerLayer, rect: BoxRect, scale: number): void => {
  if (hasCustomCorners(layer)) {
    ctx.clip(new Path2D(cornerPathD(layer, rect, scale)));
    return;
  }
  const radius = (layer.borderRadius ?? 0) * scale;
  ctx.beginPath();
  if (radius > 0) ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
  else ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
};
