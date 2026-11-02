import type { SoundFrame } from "./sound-frame-plan";

const coverScale = (frame: SoundFrame): number =>
  Math.max(frame.scale, 1 + 2 * Math.abs(frame.shiftX), 1 + 2 * Math.abs(frame.shiftY));

export const paintSoundFrame = (context: CanvasRenderingContext2D, bitmap: CanvasImageSource, frame: SoundFrame): void => {
  const { width, height } = context.canvas;
  const scale = coverScale(frame);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const left = (width - drawWidth) / 2 + frame.shiftX * width;
  const top = (height - drawHeight) / 2 + frame.shiftY * height;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, left, top, drawWidth, drawHeight);
};
