const CHANNELS = 4;

export interface WarpPoint {
  x: number;
  y: number;
  blendX: number;
  blendY: number;
  blend: number;
}

export interface WarpMapper {
  map: (x: number, y: number, point: WarpPoint) => void;
}

export interface PixelBuffer {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

const sampleBilinear = (source: PixelBuffer, sampleX: number, sampleY: number, target: Uint8ClampedArray, targetIndex: number): void => {
  const { data, width, height } = source;
  const clampedX = sampleX < 0 ? 0 : sampleX > width - 1 ? width - 1 : sampleX;
  const clampedY = sampleY < 0 ? 0 : sampleY > height - 1 ? height - 1 : sampleY;
  const left = Math.floor(clampedX);
  const top = Math.floor(clampedY);
  const right = left + 1 < width ? left + 1 : left;
  const bottom = top + 1 < height ? top + 1 : top;
  const weightX = clampedX - left;
  const weightY = clampedY - top;
  const topLeft = (top * width + left) * CHANNELS;
  const topRight = (top * width + right) * CHANNELS;
  const bottomLeft = (bottom * width + left) * CHANNELS;
  const bottomRight = (bottom * width + right) * CHANNELS;
  for (let channel = 0; channel < CHANNELS; channel++) {
    const upper = data[topLeft + channel] + (data[topRight + channel] - data[topLeft + channel]) * weightX;
    const lower = data[bottomLeft + channel] + (data[bottomRight + channel] - data[bottomLeft + channel]) * weightX;
    target[targetIndex + channel] = upper + (lower - upper) * weightY;
  }
};

const blendSecondSample = (source: PixelBuffer, point: WarpPoint, target: Uint8ClampedArray, targetIndex: number, scratch: Uint8ClampedArray): void => {
  sampleBilinear(source, point.blendX, point.blendY, scratch, 0);
  for (let channel = 0; channel < CHANNELS; channel++) {
    target[targetIndex + channel] += (scratch[channel] - target[targetIndex + channel]) * point.blend;
  }
};

export const warpPixels = (source: PixelBuffer, target: Uint8ClampedArray, mapper: WarpMapper): void => {
  const point: WarpPoint = { x: 0, y: 0, blendX: 0, blendY: 0, blend: 0 };
  const scratch = new Uint8ClampedArray(CHANNELS);
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      point.blend = 0;
      mapper.map(x, y, point);
      const targetIndex = (y * source.width + x) * CHANNELS;
      sampleBilinear(source, point.x, point.y, target, targetIndex);
      if (point.blend > 0) blendSecondSample(source, point, target, targetIndex, scratch);
    }
  }
};
