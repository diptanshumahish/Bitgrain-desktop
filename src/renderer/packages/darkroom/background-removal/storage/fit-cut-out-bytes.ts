const PNG_MIME = "image/png";
const CUT_OUT_MAX_BYTES = 15 * 1024 * 1024;
const SHRINK_SAFETY = 0.9;
const MAX_SHRINK_PASSES = 3;

const shrinkCutOut = async (blob: Blob, scale: number): Promise<Blob> => {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2d context to shrink the cut-out");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.convertToBlob({ type: PNG_MIME });
};

export const fitCutOutBytes = async (blob: Blob, passesLeft: number = MAX_SHRINK_PASSES): Promise<Blob> => {
  if (blob.size <= CUT_OUT_MAX_BYTES || passesLeft === 0) return blob;
  const scale = Math.sqrt(CUT_OUT_MAX_BYTES / blob.size) * SHRINK_SAFETY;
  return fitCutOutBytes(await shrinkCutOut(blob, scale), passesLeft - 1);
};
