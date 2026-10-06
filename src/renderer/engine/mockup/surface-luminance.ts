import { solveQuadToUnitSquare, projectPoint } from "./homography";
import type { MockupQuad } from "./mockup-types";

const SAMPLE_GRID = 96;
const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;
const BYTE_MAX = 255;
const FALLBACK_LUMINANCE = 0.5;

const readBaseSamples = (base: TexImageSource): ImageData | null => {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_GRID;
  canvas.height = SAMPLE_GRID;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(base as CanvasImageSource, 0, 0, SAMPLE_GRID, SAMPLE_GRID);
  try {
    return context.getImageData(0, 0, SAMPLE_GRID, SAMPLE_GRID);
  } catch {
    return null;
  }
};

export class SurfaceSampler {
  private readonly samples: ImageData | null;

  constructor(base: TexImageSource) {
    this.samples = readBaseSamples(base);
  }

  measure(corners: MockupQuad): number {
    const inverse = solveQuadToUnitSquare(corners);
    if (!inverse || !this.samples) return FALLBACK_LUMINANCE;

    let total = 0;
    let count = 0;
    for (let row = 0; row < SAMPLE_GRID; row += 1) {
      for (let column = 0; column < SAMPLE_GRID; column += 1) {
        const point = { x: (column + 0.5) / SAMPLE_GRID, y: (row + 0.5) / SAMPLE_GRID };
        const uv = projectPoint(inverse, point);
        if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) continue;
        const offset = (row * SAMPLE_GRID + column) * 4;
        total +=
          (this.samples.data[offset] / BYTE_MAX) * LUMA_RED +
          (this.samples.data[offset + 1] / BYTE_MAX) * LUMA_GREEN +
          (this.samples.data[offset + 2] / BYTE_MAX) * LUMA_BLUE;
        count += 1;
      }
    }
    return count === 0 ? FALLBACK_LUMINANCE : total / count;
  }
}
