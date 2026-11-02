const SAMPLE_PIXEL_BUDGET = 1_048_576;
const BAND_COUNT = 4;
const BAND_ROW_ALIGNMENT = 16;
const HARD_MAX_DIMENSION = 16384;

interface ExportPixelSample {
  data: Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
  areaRatio: number;
}

interface ExportSize {
  width: number;
  height: number;
}

const exportSizeFor = (canvas: HTMLCanvasElement, scale: number): ExportSize => {
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));
  const fit = Math.min(1, HARD_MAX_DIMENSION / Math.max(width, height));
  return { width: Math.max(1, Math.floor(width * fit)), height: Math.max(1, Math.floor(height * fit)) };
};

const drawWhole = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, size: ExportSize): void => {
  context.drawImage(canvas, 0, 0, size.width, size.height);
};

const drawSpreadBands = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, size: ExportSize, bandHeight: number): void => {
  const sourcePerExportY = canvas.height / size.height;
  for (let band = 0; band < BAND_COUNT; band++) {
    const centerY = ((band + 0.5) * size.height) / BAND_COUNT;
    context.drawImage(
      canvas,
      0,
      (centerY - bandHeight / 2) * sourcePerExportY,
      canvas.width,
      bandHeight * sourcePerExportY,
      0,
      band * bandHeight,
      size.width,
      bandHeight,
    );
  }
};

const bandHeightFor = (size: ExportSize): number => {
  const rows = Math.floor(SAMPLE_PIXEL_BUDGET / size.width / BAND_COUNT);
  const aligned = Math.max(BAND_ROW_ALIGNMENT, rows - (rows % BAND_ROW_ALIGNMENT));
  return Math.min(aligned, Math.floor(size.height / BAND_COUNT));
};

export const sampleExportPixels = (canvas: HTMLCanvasElement, scale: number): ExportPixelSample | null => {
  const size = exportSizeFor(canvas, scale);
  const fitsWhole = size.width * size.height <= SAMPLE_PIXEL_BUDGET;
  const bandHeight = bandHeightFor(size);
  const sampleWidth = size.width;
  const sampleHeight = fitsWhole ? size.height : bandHeight * BAND_COUNT;
  const sample = document.createElement("canvas");
  sample.width = sampleWidth;
  sample.height = sampleHeight;
  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.imageSmoothingEnabled = false;
  if (fitsWhole) drawWhole(context, canvas, size);
  else drawSpreadBands(context, canvas, size, bandHeight);
  return {
    data: context.getImageData(0, 0, sampleWidth, sampleHeight).data,
    width: sampleWidth,
    height: sampleHeight,
    areaRatio: (size.width * size.height) / (sampleWidth * sampleHeight),
  };
};
