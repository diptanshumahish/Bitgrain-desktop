import { toGrayImage, blurGrayImage } from "./detect/gray-image";
import { sobelMagnitude, magnitudeThreshold } from "./detect/sobel";
import type { RasterSource } from "./detect/gray-image";
import type { GradientField } from "./detect/sobel";
import type { MockupPoint } from "./mockup-types";

const EDGE_MAP_MAX_EDGE = 900;
const EDGE_KEEP_FRACTION = 0.06;

export class EdgeMap {
  private readonly field: GradientField | null;
  private readonly threshold: number;

  constructor(source: RasterSource) {
    const gray = toGrayImage(source, EDGE_MAP_MAX_EDGE);
    this.field = gray ? sobelMagnitude(blurGrayImage(gray)) : null;
    this.threshold = this.field ? magnitudeThreshold(this.field, EDGE_KEEP_FRACTION) : 0;
  }

  snap(point: MockupPoint, radiusFraction: number): MockupPoint | null {
    const { field, threshold } = this;
    if (!field || threshold <= 0) return null;

    const centerX = point.x * field.width;
    const centerY = point.y * field.height;
    const radius = Math.max(1, Math.round(radiusFraction * Math.max(field.width, field.height)));

    let bestValue = threshold;
    let bestPoint: MockupPoint | null = null;
    for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        const sampleX = Math.round(centerX) + offsetX;
        const sampleY = Math.round(centerY) + offsetY;
        if (sampleX < 0 || sampleY < 0 || sampleX >= field.width || sampleY >= field.height) continue;
        if (Math.hypot(offsetX, offsetY) > radius) continue;

        const value = field.magnitude[sampleY * field.width + sampleX];
        if (value <= bestValue) continue;
        bestValue = value;
        bestPoint = { x: sampleX / field.width, y: sampleY / field.height };
      }
    }
    return bestPoint;
  }
}
