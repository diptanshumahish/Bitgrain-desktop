const CHANNEL_MAX = 255;

export const rasterizeBrushAlpha = (brush: CanvasImageSource, width: number, height: number): Float32Array => {
  const alpha = new Float32Array(width * height);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return alpha;
  ctx.drawImage(brush, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  for (let index = 0; index < alpha.length; index += 1) {
    alpha[index] = pixels[index * 4 + 3] / CHANNEL_MAX;
  }
  return alpha;
};
