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

export const coverFit = (
  ctx: CanvasRenderingContext2D,
  img: DrawSource,
  x: number,
  y: number,
  w: number,
  h: number,
): void => {
  const iw = sourceWidth(img);
  const ih = sourceHeight(img);
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
};

export const containFit = (
  ctx: CanvasRenderingContext2D,
  img: DrawSource,
  x: number,
  y: number,
  w: number,
  h: number,
): void => {
  const iw = sourceWidth(img);
  const ih = sourceHeight(img);
  const scale = Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
};
