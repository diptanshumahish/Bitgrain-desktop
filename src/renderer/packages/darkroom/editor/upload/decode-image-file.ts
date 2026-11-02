import { UnreadableImageError } from "./upload-errors";
import { withTimeout } from "./convert/with-timeout";

const DECODE_TIMEOUT_MS = 30_000;

export interface DecodedSize {
  width: number;
  height: number;
}

const decodeWithImageElement = async (file: Blob): Promise<DecodedSize> => {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
};

const decodeWithBitmap = async (file: Blob): Promise<DecodedSize> => {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
};

const confirmBitmapDecodes = async (file: Blob): Promise<void> => {
  if (typeof createImageBitmap !== "function") return;
  const bitmap = await createImageBitmap(file);
  bitmap.close();
};

const decodeAnyWay = async (file: Blob): Promise<DecodedSize> => {
  try {
    const size = await decodeWithImageElement(file);
    await confirmBitmapDecodes(file);
    return size;
  } catch (error) {
    console.warn("image element decode failed, trying a bitmap decode", error);
    return decodeWithBitmap(file);
  }
};

export const decodeImageFile = async (file: Blob): Promise<DecodedSize> => {
  try {
    const size = await withTimeout(decodeAnyWay(file), DECODE_TIMEOUT_MS, "Image decode");
    if (size.width < 1 || size.height < 1) throw new UnreadableImageError();
    return size;
  } catch (error) {
    if (error instanceof UnreadableImageError) throw error;
    throw new UnreadableImageError();
  }
};
