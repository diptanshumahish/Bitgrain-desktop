import heic2any from "heic2any";

const HEIC_QUALITY = 0.8;

export const processImageFile = async (file: File): Promise<string> => {
  let blob: Blob = file;

  const isHeic =
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif";

  if (isHeic) {
    try {
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: HEIC_QUALITY,
      });
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch (err) {
      console.error("HEIC conversion failed:", err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
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
