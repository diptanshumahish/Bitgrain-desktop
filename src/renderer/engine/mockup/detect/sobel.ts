import type { GrayImage } from "./gray-image";

export interface GradientField {
  magnitude: Float32Array;
  width: number;
  height: number;
  maxMagnitude: number;
}

export const sobelMagnitude = (image: GrayImage): GradientField => {
  const { data, width, height } = image;
  const magnitude = new Float32Array(width * height);
  let maxMagnitude = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const topLeft = data[(y - 1) * width + (x - 1)];
      const top = data[(y - 1) * width + x];
      const topRight = data[(y - 1) * width + (x + 1)];
      const left = data[y * width + (x - 1)];
      const right = data[y * width + (x + 1)];
      const bottomLeft = data[(y + 1) * width + (x - 1)];
      const bottom = data[(y + 1) * width + x];
      const bottomRight = data[(y + 1) * width + (x + 1)];

      const gradientX = topRight + 2 * right + bottomRight - topLeft - 2 * left - bottomLeft;
      const gradientY = bottomLeft + 2 * bottom + bottomRight - topLeft - 2 * top - topRight;
      const value = Math.hypot(gradientX, gradientY);
      magnitude[y * width + x] = value;
      if (value > maxMagnitude) maxMagnitude = value;
    }
  }
  return { magnitude, width, height, maxMagnitude };
};

export const magnitudeThreshold = (field: GradientField, keepFraction: number): number => {
  const BUCKETS = 256;
  if (field.maxMagnitude <= 0) return 0;
  const histogram = new Uint32Array(BUCKETS);
  for (let index = 0; index < field.magnitude.length; index += 1) {
    const bucket = Math.min(BUCKETS - 1, Math.floor((field.magnitude[index] / field.maxMagnitude) * (BUCKETS - 1)));
    histogram[bucket] += 1;
  }

  const target = Math.floor(field.magnitude.length * keepFraction);
  let counted = 0;
  for (let bucket = BUCKETS - 1; bucket >= 0; bucket -= 1) {
    counted += histogram[bucket];
    if (counted >= target) return (bucket / (BUCKETS - 1)) * field.maxMagnitude;
  }
  return 0;
};
