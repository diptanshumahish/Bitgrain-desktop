import { boxBlurField, fieldAt, type FloatField } from "../shared/float-field";
import { mix, smoothRange } from "../shared/ink-math";

const SOBEL_WEIGHT = 0.25;
const SOBEL_CENTRE = 2;
const SHADOW_FLOOR = 0.55;
const SHADOW_GAIN = 0.45;
const RIDGE_FLOOR = 0.35;
const RIDGE_START = -0.02;
const RIDGE_END = 0.015;
const COARSE_SPACING = 3;
const COARSE_BLUR = 2.5;
const COARSE_WEIGHT = 0.45;
const MIN_LENGTH = 1e-6;

export interface EdgeFields {
  edge: Float32Array;
  neighbour: Float32Array;
}

interface Gradient {
  magnitude: Float32Array;
  stepX: Int8Array;
  stepY: Int8Array;
}

const gradientAt = (field: FloatField, x: number, y: number, step: number, out: Gradient, index: number): void => {
  const left = x - step;
  const right = x + step;
  const up = y - step;
  const below = y + step;
  const topLeft = fieldAt(field, left, up);
  const topRight = fieldAt(field, right, up);
  const bottomLeft = fieldAt(field, left, below);
  const bottomRight = fieldAt(field, right, below);
  const across = topRight + SOBEL_CENTRE * fieldAt(field, right, y) + bottomRight - topLeft - SOBEL_CENTRE * fieldAt(field, left, y) - bottomLeft;
  const down = bottomLeft + SOBEL_CENTRE * fieldAt(field, x, below) + bottomRight - topLeft - SOBEL_CENTRE * fieldAt(field, x, up) - topRight;
  const length = Math.max(MIN_LENGTH, Math.hypot(across, down));
  out.magnitude[index] = (length * SOBEL_WEIGHT) / (SHADOW_FLOOR + SHADOW_GAIN * fieldAt(field, x, y));
  out.stepX[index] = Math.round(across / length);
  out.stepY[index] = Math.round(down / length);
};

const gradientField = (field: FloatField, step: number): Gradient => {
  const size = field.width * field.height;
  const gradient: Gradient = { magnitude: new Float32Array(size), stepX: new Int8Array(size), stepY: new Int8Array(size) };
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) gradientAt(field, x, y, step, gradient, y * field.width + x);
  }
  return gradient;
};

const magnitudeAt = (gradient: Gradient, width: number, height: number, x: number, y: number): number => {
  const column = x < 0 ? 0 : x >= width ? width - 1 : x;
  const row = y < 0 ? 0 : y >= height ? height - 1 : y;
  return gradient.magnitude[row * width + column];
};

const thinnedRow = (gradient: Gradient, width: number, height: number, y: number, step: number, out: EdgeFields): void => {
  for (let x = 0; x < width; x++) {
    const index = y * width + x;
    const offsetX = gradient.stepX[index] * step;
    const offsetY = gradient.stepY[index] * step;
    const centre = gradient.magnitude[index];
    const forward = magnitudeAt(gradient, width, height, x + offsetX, y + offsetY);
    const backward = magnitudeAt(gradient, width, height, x - offsetX, y - offsetY);
    out.edge[index] = centre * mix(RIDGE_FLOOR, 1, smoothRange(RIDGE_START, RIDGE_END, centre - Math.max(forward, backward)));
    out.neighbour[index] = Math.max(
      magnitudeAt(gradient, width, height, x - step, y), magnitudeAt(gradient, width, height, x + step, y),
      magnitudeAt(gradient, width, height, x, y - step), magnitudeAt(gradient, width, height, x, y + step),
    );
  }
};

const scaleEdges = (luma: FloatField, blurRadius: number, step: number): EdgeFields => {
  const blurred = boxBlurField(luma, blurRadius);
  const gradient = gradientField(blurred, step);
  const size = luma.width * luma.height;
  const out: EdgeFields = { edge: new Float32Array(size), neighbour: new Float32Array(size) };
  for (let y = 0; y < luma.height; y++) thinnedRow(gradient, luma.width, luma.height, y, step, out);
  return out;
};

export const cyanotypeEdges = (luma: FloatField, step: number): EdgeFields => {
  const fine = scaleEdges(luma, step, step);
  const coarse = scaleEdges(luma, Math.round(COARSE_BLUR * step), COARSE_SPACING * step);
  for (let index = 0; index < fine.edge.length; index++) {
    fine.edge[index] = Math.max(fine.edge[index], COARSE_WEIGHT * coarse.edge[index]);
    fine.neighbour[index] = Math.max(fine.neighbour[index], COARSE_WEIGHT * coarse.neighbour[index]);
  }
  return fine;
};
