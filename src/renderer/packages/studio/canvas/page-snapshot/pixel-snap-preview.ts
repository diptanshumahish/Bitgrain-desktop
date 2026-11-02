import type { UploadLayer } from "@bitgrain/studio-core/model/studio-types";
import { fittedRect } from "@bitgrain/studio-core/image/image-crop";

const MIN_EDGE_PX = 1;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("preview load failed"));
    img.src = src;
  });

const canvasToObjectUrl = (canvas: HTMLCanvasElement): Promise<string> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("snap encode failed"))));
  });

export const pixelSnapPreview = async (previewUrl: string, layer: UploadLayer, scale: number): Promise<string> => {
  const img = await loadImage(previewUrl);
  const box = { x: 0, y: 0, width: layer.width * scale, height: layer.height * scale };
  const rect = fittedRect(layer.fit, img.naturalWidth, img.naturalHeight, box, layer.crop);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(MIN_EDGE_PX, Math.round(rect.width));
  canvas.height = Math.max(MIN_EDGE_PX, Math.round(rect.height));
  const context = canvas.getContext("2d");
  if (!context) return previewUrl;
  context.imageSmoothingEnabled = false;
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToObjectUrl(canvas);
};
