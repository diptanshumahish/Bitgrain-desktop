import { signal } from "../lib/signal";
import { imageSignal } from "./image-store";

export interface PreviewThumb {
  src: string;
  id: number;
}

const SAMPLE_THUMB: PreviewThumb = { src: "/sample.jpg", id: 0 };
const THUMB_MAX_EDGE = 640;
const JPEG_QUALITY = 0.85;

export const previewThumbSignal = signal<PreviewThumb>(SAMPLE_THUMB);

const counter = { next: 1 };

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("could not load image for preview thumbnails"));
    image.src = src;
  });

const drawThumb = (image: HTMLImageElement): string => {
  const scale = Math.min(1, THUMB_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
};

const refreshThumb = async (): Promise<void> => {
  const source = imageSignal.value;
  if (!source) {
    previewThumbSignal.value = SAMPLE_THUMB;
    return;
  }
  try {
    const thumb = drawThumb(await loadImage(source));
    if (imageSignal.value !== source) return;
    counter.next += 1;
    previewThumbSignal.value = { src: thumb, id: counter.next };
  } catch (error) {
    console.error("preview thumbnail failed:", error);
    previewThumbSignal.value = SAMPLE_THUMB;
  }
};

imageSignal.subscribe(() => {
  void refreshThumb();
});
void refreshThumb();
