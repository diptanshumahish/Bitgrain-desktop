import { convertHeicToJpeg, isHeicFile } from "../pages/home-page/upload/convert/convert-heic";

const readAsDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const processImageFile = async (file: File): Promise<string> => {
  const blob = isHeicFile(file) ? await convertHeicToJpeg(file) : file;
  return readAsDataUrl(blob);
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
