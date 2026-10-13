import { alphaToCanvas, type AlphaSource } from "./alpha-canvas";

const OVERLAY_RGB: [number, number, number] = [255, 71, 87];
const OVERLAY_OPACITY = 0.5;

export const drawMaskOverlay = (target: HTMLCanvasElement, alpha: AlphaSource, width: number, height: number): void => {
  const ctx = target.getContext("2d");
  if (!ctx) return;
  const tint = alphaToCanvas(alpha, width, height, OVERLAY_RGB);
  ctx.save();
  ctx.globalAlpha = OVERLAY_OPACITY;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tint, 0, 0, target.width, target.height);
  ctx.restore();
};
