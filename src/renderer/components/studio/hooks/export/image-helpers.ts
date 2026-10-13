import type { ImageCrop } from "../../../../data/studioTypes";
import { fittedRect, type FittedRect, type ImageFit } from "../../../../utils/image-crop";

export const applyFlip = (
  ctx: CanvasRenderingContext2D,
  layer: { x: number; y: number; width: number; height: number; flipH?: boolean; flipV?: boolean },
  s: number,
): void => {
  if (!layer.flipH && !layer.flipV) return;
  const cx = (layer.x + layer.width / 2) * s;
  const cy = (layer.y + layer.height / 2) * s;
  ctx.translate(cx, cy);
  ctx.scale(layer.flipH ? -1 : 1, layer.flipV ? -1 : 1);
  ctx.translate(-cx, -cy);
};

export const applyRotation = (
  ctx: CanvasRenderingContext2D,
  layer: { x: number; y: number; width: number; height: number; rotation?: number },
  s: number,
): void => {
  if (!layer.rotation) return;
  const cx = (layer.x + layer.width / 2) * s;
  const cy = (layer.y + layer.height / 2) * s;
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);
};

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (/^https?:/.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

type DrawSource = HTMLImageElement | HTMLCanvasElement;

const sourceWidth = (img: DrawSource): number => img.width;
const sourceHeight = (img: DrawSource): number => img.height;

export const drawFitted = (
  ctx: CanvasRenderingContext2D,
  img: DrawSource,
  fit: ImageFit,
  box: FittedRect,
  crop?: ImageCrop,
): void => {
  const rect = fittedRect(fit, sourceWidth(img), sourceHeight(img), box, crop);
  ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
};
