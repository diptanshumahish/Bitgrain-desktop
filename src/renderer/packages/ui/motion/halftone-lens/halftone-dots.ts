export interface HalftoneDot {
  x: number;
  y: number;
  darkness: number;
}

const RED_WEIGHT = 0.299;
const GREEN_WEIGHT = 0.587;
const BLUE_WEIGHT = 0.114;
const CHANNEL_MAX = 255;

const sampleCoverPixels = (image: HTMLImageElement, columns: number, rows: number): Uint8ClampedArray | null => {
  const sampler = document.createElement("canvas");
  sampler.width = columns;
  sampler.height = rows;
  const context = sampler.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const scale = Math.max(columns / image.naturalWidth, rows / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, (columns - drawWidth) / 2, (rows - drawHeight) / 2, drawWidth, drawHeight);
  return context.getImageData(0, 0, columns, rows).data;
};

export const buildDotField = (image: HTMLImageElement, width: number, height: number, cell: number): HalftoneDot[] => {
  const columns = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const pixels = sampleCoverPixels(image, columns, rows);
  if (!pixels) return [];
  const dots: HalftoneDot[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = (row * columns + column) * 4;
      const light = (pixels[index] * RED_WEIGHT + pixels[index + 1] * GREEN_WEIGHT + pixels[index + 2] * BLUE_WEIGHT) / CHANNEL_MAX;
      dots.push({ x: column * cell + cell / 2, y: row * cell + cell / 2, darkness: 1 - light });
    }
  }
  return dots;
};
