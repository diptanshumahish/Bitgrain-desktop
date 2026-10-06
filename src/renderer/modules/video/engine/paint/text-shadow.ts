import type { TextClip } from "../../types";

const SHADOW_BLUR_FACTOR = 0.04;
const SHADOW_OFFSET_FACTOR = 0.02;

export function applyTextShadow(
  ctx: CanvasRenderingContext2D,
  clip: TextClip,
  pixelScale: number,
): void {
  if (clip.shadow === undefined) {
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = Math.max(2, clip.size * SHADOW_BLUR_FACTOR) * pixelScale;
    ctx.shadowOffsetY = Math.max(1, clip.size * SHADOW_OFFSET_FACTOR) * pixelScale;
    return;
  }
  if (!clip.shadow.enabled) {
    ctx.shadowColor = "transparent";
    return;
  }
  ctx.shadowColor = clip.shadow.color;
  ctx.shadowBlur = clip.shadow.blur * pixelScale;
  ctx.shadowOffsetX = clip.shadow.offsetX * pixelScale;
  ctx.shadowOffsetY = clip.shadow.offsetY * pixelScale;
}
