export interface SampledPixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

const SAMPLE_DIM = 96;

const drawToPixels = (img: HTMLImageElement): SampledPixels => {
  const scale = Math.min(1, SAMPLE_DIM / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable for image sampling");
  ctx.drawImage(img, 0, 0, width, height);
  return { data: ctx.getImageData(0, 0, width, height).data, width, height };
};

export const sampleImagePixels = (url: string): Promise<SampledPixels> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        resolve(drawToPixels(img));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("image failed to load for sampling"));
    img.src = url;
  });
