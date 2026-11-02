import type { SourceImage } from "../../../engine/style-definition";
import { toFloatImage, type FloatImage } from "./float-image";

const resizedPixels = (source: SourceImage, width: number, height: number): SourceImage => {
  const full = new OffscreenCanvas(source.width, source.height);
  const fullContext = full.getContext("2d");
  const small = new OffscreenCanvas(width, height);
  const smallContext = small.getContext("2d");
  if (!fullContext || !smallContext) throw new Error("2D canvas is not available");
  const image = fullContext.createImageData(source.width, source.height);
  image.data.set(source.data);
  fullContext.putImageData(image, 0, 0);
  smallContext.imageSmoothingEnabled = true;
  smallContext.imageSmoothingQuality = "high";
  smallContext.drawImage(full, 0, 0, width, height);
  return { data: smallContext.getImageData(0, 0, width, height).data, width, height };
};

export const workingImage = (source: SourceImage, longEdge: number): FloatImage => {
  const factor = Math.min(1, longEdge / Math.max(source.width, source.height));
  if (factor >= 1) return toFloatImage(source);
  const width = Math.max(1, Math.round(source.width * factor));
  const height = Math.max(1, Math.round(source.height * factor));
  return toFloatImage(resizedPixels(source, width, height));
};
