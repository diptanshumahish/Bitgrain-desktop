export const buildWorkingImageData = (
  img: HTMLImageElement,
  maxDim: number,
): ImageData | null => {
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = Math.min(1, maxDim / longEdge);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};
