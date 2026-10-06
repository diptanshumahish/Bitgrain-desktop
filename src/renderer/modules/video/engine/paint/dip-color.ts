import type { VideoClip } from "../../types";

type DipContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function layerFadeAlpha(clip: VideoClip, fade: number): number {
  return clip.dipColor ? 1 : fade;
}

export function paintDipColor(
  ctx: DipContext,
  clip: VideoClip,
  fade: number,
  width: number,
  height: number,
): void {
  if (!clip.dipColor || fade >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - fade;
  ctx.fillStyle = clip.dipColor;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
