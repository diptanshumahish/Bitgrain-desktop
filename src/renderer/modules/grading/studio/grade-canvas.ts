import type { ColorGrade } from "../engine/grade-types";
import { applyGrade } from "../engine/apply-grade";
import { createCanvas } from "../../../engine/selective/brush-canvas";
import { fitWithin } from "../../../utils/bitgrain-effect-core";

export const sourceSize = (source: HTMLImageElement | HTMLCanvasElement): { width: number; height: number } =>
  source instanceof HTMLImageElement
    ? { width: source.naturalWidth || source.width, height: source.naturalHeight || source.height }
    : { width: source.width, height: source.height };

export const gradeCanvasInPlace = (canvas: HTMLCanvasElement, grade: ColorGrade | undefined): void => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || canvas.width === 0 || canvas.height === 0) return;
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyGrade(image.data, grade);
  ctx.putImageData(image, 0, 0);
};

export const drawFitted = (source: HTMLImageElement | HTMLCanvasElement, maxDimension: number): HTMLCanvasElement => {
  const { width, height } = sourceSize(source);
  const { w, h } = fitWithin(width, height, maxDimension);
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
};
