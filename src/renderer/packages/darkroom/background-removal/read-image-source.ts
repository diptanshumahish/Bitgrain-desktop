import { BackgroundRemovalError } from "@bitgrain/engine/background/removal-error";

interface DecodedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

const fetchImageBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image request failed with status ${response.status}`);
  return response.blob();
};

export const decodeImageSource = async (url: string): Promise<DecodedImage> => {
  try {
    const bitmap = await createImageBitmap(await fetchImageBlob(url));
    return { bitmap, width: bitmap.width, height: bitmap.height };
  } catch (error) {
    throw new BackgroundRemovalError("unreadable", error instanceof Error ? error.message : String(error));
  }
};
