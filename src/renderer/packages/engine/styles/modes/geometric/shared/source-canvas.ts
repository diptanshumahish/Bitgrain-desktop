import { Frame, frameFromPixels } from "../../../engine/frame";
import type { SourceImage } from "../../../engine/style-definition";

export const sourceCanvas = (source: SourceImage): OffscreenCanvas =>
  frameFromPixels(source.data, source.width, source.height).canvas;

export const downscaleSource = (source: SourceImage, longEdge: number): SourceImage => {
  const factor = longEdge / Math.max(source.width, source.height);
  if (factor >= 1) return source;
  const width = Math.max(1, Math.round(source.width * factor));
  const height = Math.max(1, Math.round(source.height * factor));
  const frame = new Frame(width, height);
  const context = frame.context;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(sourceCanvas(source), 0, 0, width, height);
  return { data: frame.readPixels(), width, height };
};

export const fillFrame = (frame: Frame, colour: string): void => {
  const context = frame.context;
  context.fillStyle = colour;
  context.fillRect(0, 0, frame.width, frame.height);
};
