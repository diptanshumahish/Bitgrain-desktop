const MAX_IMAGE_EDGE = 4096;
const ENCODE_QUALITY = 0.92;
const PASSTHROUGH_TYPES = ["image/svg+xml", "image/gif"];
const REENCODABLE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FALLBACK_TYPE = "image/png";

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

export async function downscaleImageDataUrl(dataUrl: string, mimeType: string): Promise<string> {
  if (PASSTHROUGH_TYPES.includes(mimeType)) return dataUrl;
  const image = await loadImage(dataUrl);
  if (!image) return dataUrl;
  const longEdge = Math.max(image.naturalWidth, image.naturalHeight);
  if (longEdge <= MAX_IMAGE_EDGE) return dataUrl;
  const scale = MAX_IMAGE_EDGE / longEdge;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const outputType = REENCODABLE_TYPES.includes(mimeType) ? mimeType : FALLBACK_TYPE;
  return canvas.toDataURL(outputType, ENCODE_QUALITY);
}
