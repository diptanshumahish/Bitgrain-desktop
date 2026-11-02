import type { CleanedImage } from "./metadata-types";

const REBUILT_MIME = "image/png";

export const rebuildFromPixels = async (file: File): Promise<CleanedImage> => {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read this image");
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: REBUILT_MIME });
  return { blob, found: [], rebuilt: true };
};
