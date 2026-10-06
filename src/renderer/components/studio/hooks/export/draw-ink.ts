import type { InkLayer } from "../../../../data/studioTypes";
import { loadImage } from "./image-helpers";

const buildInkSvg = (layer: InkLayer): string => {
  const paths = layer.strokes
    .map((stroke) => `<path d="${stroke.d}" fill="${layer.color}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layer.viewW} ${layer.viewH}" preserveAspectRatio="none" width="${layer.width}" height="${layer.height}">${paths}</svg>`;
};

export const drawInkLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: InkLayer,
  s: number,
): Promise<void> => {
  if (layer.strokes.length === 0) return;
  const svgStr = buildInkSvg(layer);
  const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
  try {
    const img = await loadImage(dataUrl);
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    if (layer.rotation || layer.flipH || layer.flipV) {
      const cx = (layer.x + layer.width / 2) * s;
      const cy = (layer.y + layer.height / 2) * s;
      ctx.translate(cx, cy);
      if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.flipH ? -1 : 1, layer.flipV ? -1 : 1);
      ctx.translate(-cx, -cy);
    }
    ctx.drawImage(img, layer.x * s, layer.y * s, layer.width * s, layer.height * s);
    ctx.restore();
  } catch {
    /* skip */
  }
};
