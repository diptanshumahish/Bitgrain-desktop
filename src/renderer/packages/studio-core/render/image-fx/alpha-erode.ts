import { blankCanvas, context2d } from "./fx-canvas";

const KERNEL_STEPS = [-1, -0.5, 0, 0.5, 1];
const SOLID = "#000000";

const invertedAlpha = (source: HTMLCanvasElement, pad: number): HTMLCanvasElement => {
  const canvas = blankCanvas(source.width + pad * 2, source.height + pad * 2);
  const ctx = context2d(canvas);
  ctx.fillStyle = SOLID;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "destination-out";
  ctx.drawImage(source, pad, pad);
  return canvas;
};

const dilate = (source: HTMLCanvasElement, radius: number): HTMLCanvasElement => {
  const canvas = blankCanvas(source.width, source.height);
  const ctx = context2d(canvas);
  for (const stepX of KERNEL_STEPS) {
    for (const stepY of KERNEL_STEPS) ctx.drawImage(source, stepX * radius, stepY * radius);
  }
  return canvas;
};

export const erodeAlpha = (source: HTMLCanvasElement, radius: number): HTMLCanvasElement => {
  const pad = Math.ceil(radius);
  const grown = dilate(invertedAlpha(source, pad), radius);
  const canvas = blankCanvas(source.width, source.height);
  const ctx = context2d(canvas);
  ctx.fillStyle = SOLID;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "destination-out";
  ctx.drawImage(grown, -pad, -pad);
  return canvas;
};
