import type { DecodedSize } from "./decode-image-file";

const NORMALIZED_JPEG_QUALITY = 0.95;
const MAX_UPLOAD_LONG_EDGE = 8192;
const NORMALIZE_EXEMPT_TYPES = new Set(["image/gif", "image/svg+xml"]);

const needsDownscale = (file: File, size: DecodedSize): boolean =>
  !NORMALIZE_EXEMPT_TYPES.has(file.type) && Math.max(size.width, size.height) > MAX_UPLOAD_LONG_EDGE;

const scaledSize = (size: DecodedSize): DecodedSize => {
  const scale = MAX_UPLOAD_LONG_EDGE / Math.max(size.width, size.height);
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
};

const drawScaled = async (file: File, target: DecodedSize): Promise<Blob | null> => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const context = canvas.getContext("2d");
  if (context) context.drawImage(bitmap, 0, 0, target.width, target.height);
  bitmap.close();
  if (!context) return null;
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", NORMALIZED_JPEG_QUALITY));
};

export interface NormalizedUpload {
  file: File;
  size: DecodedSize;
}

export const normalizeUploadedFile = async (file: File, size: DecodedSize): Promise<NormalizedUpload> => {
  if (!needsDownscale(file, size)) return { file, size };
  const target = scaledSize(size);
  const blob = await drawScaled(file, target);
  if (!blob) return { file, size };
  const normalizedName = file.name.replace(/\.[^.]+$/, ".jpg");
  return { file: new File([blob], normalizedName, { type: "image/jpeg" }), size: target };
};
