import { convertHeicToJpeg, isHeicFile } from "./convert/convert-heic";
import { downscaleImageDataUrl } from "@bitgrain/core/image/downscale-image";

const readAsDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const processImageFile = async (file: File): Promise<string> => {
  const blob = isHeicFile(file) ? await convertHeicToJpeg(file) : file;
  return downscaleImageDataUrl(await readAsDataUrl(blob), blob.type);
};

export interface ImageDimensions {
  width: number;
  height: number;
}

export const probeImageDimensions = (
  src: string,
): Promise<ImageDimensions | null> =>
  new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () =>
      resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => resolve(null);
    probe.src = src;
  });
