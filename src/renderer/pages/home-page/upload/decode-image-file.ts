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

export const decodeImageFile = async (file: Blob): Promise<DecodedSize> => {
  try {
    const size = await withTimeout(decodeWithImageElement(file), DECODE_TIMEOUT_MS, "Image decode");
    if (size.width < 1 || size.height < 1) throw new UnreadableImageError();
    return size;
  } catch (error) {
    if (error instanceof UnreadableImageError) throw error;
    throw new UnreadableImageError();
  }
};
