import { renderStyle } from "@bitgrain/engine/styles/engine/render-style";
import type { StyleSettings } from "@bitgrain/engine/styles/engine/style-types";

interface ThumbJob {
  token: number;
  bitmap: ImageBitmap;
  styleIds: readonly string[];
  scale: number;
}

const THUMB_SEED = 3;
let activeToken = 0;

const readSource = (bitmap: ImageBitmap): { data: Uint8ClampedArray; width: number; height: number } => {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not available");
  context.drawImage(bitmap, 0, 0);
  return { data: context.getImageData(0, 0, bitmap.width, bitmap.height).data, width: bitmap.width, height: bitmap.height };
};

const renderThumb = (source: ReturnType<typeof readSource>, styleId: string, scale: number): ImageBitmap => {
  const settings: StyleSettings = { styleId, params: {}, effects: {} };
  const pixels = renderStyle({ source, settings, scale, seed: THUMB_SEED });
  const canvas = new OffscreenCanvas(source.width, source.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not available");
  const image = context.createImageData(source.width, source.height);
  image.data.set(pixels);
  context.putImageData(image, 0, 0);
  return canvas.transferToImageBitmap();
};

const runJob = async (job: ThumbJob): Promise<void> => {
  const source = readSource(job.bitmap);
  for (const styleId of job.styleIds) {
    if (job.token !== activeToken) return;
    const thumb = renderThumb(source, styleId, job.scale);
    (self as unknown as Worker).postMessage({ token: job.token, styleId, thumb }, [thumb]);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

self.onmessage = (event: MessageEvent<ThumbJob>): void => {
  activeToken = event.data.token;
  void runJob(event.data);
};
