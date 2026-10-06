import { createSeededRandom } from "../utils/seeded-random";

const NOISE_SCALE = 3;
const NOISE_ALPHA = 0.13;

let noiseCanvas: HTMLCanvasElement | null = null;
let mosaicCanvas: HTMLCanvasElement | null = null;

export function drawNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
): void {
  const random = createSeededRandom(seed);
  const noiseWidth = Math.max(1, Math.floor(width / NOISE_SCALE));
  const noiseHeight = Math.max(1, Math.floor(height / NOISE_SCALE));
  if (!noiseCanvas) noiseCanvas = document.createElement("canvas");
  if (noiseCanvas.width !== noiseWidth || noiseCanvas.height !== noiseHeight) {
    noiseCanvas.width = noiseWidth;
    noiseCanvas.height = noiseHeight;
  }
  const noiseCtx = noiseCanvas.getContext("2d");
  if (!noiseCtx) return;
  const image = noiseCtx.createImageData(noiseWidth, noiseHeight);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const value = (random() * 255) | 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
  noiseCtx.putImageData(image, 0, 0);
  ctx.save();
  ctx.globalAlpha = NOISE_ALPHA;
  ctx.globalCompositeOperation = "overlay";
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(noiseCanvas, 0, 0, width, height);
  ctx.restore();
}

export interface ChannelSet {
  r: HTMLCanvasElement;
  g: HTMLCanvasElement;
  b: HTMLCanvasElement;
}

interface ChannelCache extends ChannelSet {
  source: CanvasImageSource;
  width: number;
  height: number;
}

let channelCache: ChannelCache | null = null;

function makeChannel(
  base: CanvasImageSource,
  width: number,
  height: number,
  tint: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(base, 0, 0, width, height);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

export function getChannels(
  base: CanvasImageSource,
  width: number,
  height: number,
): ChannelSet {
  if (
    channelCache &&
    channelCache.source === base &&
    channelCache.width === width &&
    channelCache.height === height
  ) {
    return channelCache;
  }
  channelCache = {
    source: base,
    width,
    height,
    r: makeChannel(base, width, height, "#ff0000"),
    g: makeChannel(base, width, height, "#00ff00"),
    b: makeChannel(base, width, height, "#0000ff"),
  };
  return channelCache;
}

export function drawScaledCentered(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  width: number,
  height: number,
  scale: number,
): void {
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  ctx.drawImage(source, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export function drawMosaic(
  ctx: CanvasRenderingContext2D,
  base: CanvasImageSource,
  width: number,
  height: number,
  factor: number,
): void {
  const smallWidth = Math.max(2, Math.round(width * factor));
  const smallHeight = Math.max(2, Math.round(height * factor));
  if (!mosaicCanvas) mosaicCanvas = document.createElement("canvas");
  mosaicCanvas.width = smallWidth;
  mosaicCanvas.height = smallHeight;
  const smallCtx = mosaicCanvas.getContext("2d");
  if (!smallCtx) return;
  smallCtx.drawImage(base, 0, 0, smallWidth, smallHeight);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(mosaicCanvas, 0, 0, smallWidth, smallHeight, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
}

const clampByte = (value: number): number =>
  value < 0 ? 0 : value > 255 ? 255 : value;

export function posterize(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  levels: number,
): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const step = 255 / Math.max(1, levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
  }
  ctx.putImageData(image, 0, 0);
}

export function threshold(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  level: number,
): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const luma = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    const value = luma >= level ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  ctx.putImageData(image, 0, 0);
}

export function solarize(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  level: number,
): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > level) data[i] = 255 - data[i];
    if (data[i + 1] > level) data[i + 1] = 255 - data[i + 1];
    if (data[i + 2] > level) data[i + 2] = 255 - data[i + 2];
  }
  ctx.putImageData(image, 0, 0);
}

export function invert(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] + (255 - 2 * data[i]) * amount;
    data[i + 1] = data[i + 1] + (255 - 2 * data[i + 1]) * amount;
    data[i + 2] = data[i + 2] + (255 - 2 * data[i + 2]) * amount;
  }
  ctx.putImageData(image, 0, 0);
}

export function contrast(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  factor: number,
): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clampByte((data[i] - 128) * factor + 128);
    data[i + 1] = clampByte((data[i + 1] - 128) * factor + 128);
    data[i + 2] = clampByte((data[i + 2] - 128) * factor + 128);
  }
  ctx.putImageData(image, 0, 0);
}
