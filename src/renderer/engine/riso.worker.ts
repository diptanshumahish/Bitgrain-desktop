interface RisoRequest {
  id: number;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  inks: number[][];
}

interface RisoResponse {
  id: number;
  width: number;
  height: number;
  preview: ArrayBuffer;
  layers: ArrayBuffer[];
}

const RGBA_STRIDE = 4;

const clamp01 = (value: number): number =>
  value < 0 ? 0 : value > 1 ? 1 : value;

const clampByte = (value: number): number =>
  value < 0 ? 0 : value > 255 ? 255 : value;

self.onmessage = (event: MessageEvent<RisoRequest>) => {
  const { id, buffer, width, height, inks } = event.data;
  const source = new Uint8ClampedArray(buffer);
  const total = width * height;
  const inkCount = inks.length;

  // Each ink subtracts (paper - inkColor) from white paper. Per pixel we project
  // the required darkening onto each ink vector to get that ink's density.
  const inkVectors = inks.map((color) => [255 - color[0], 255 - color[1], 255 - color[2]]);
  const inkNorms = inkVectors.map((v) => v[0] * v[0] + v[1] * v[1] + v[2] * v[2] || 1);

  const layers = inks.map(() => new Uint8ClampedArray(total * RGBA_STRIDE));
  const preview = new Uint8ClampedArray(total * RGBA_STRIDE);

  for (let pixel = 0; pixel < total; pixel += 1) {
    const index = pixel * RGBA_STRIDE;
    const demandR = 255 - source[index];
    const demandG = 255 - source[index + 1];
    const demandB = 255 - source[index + 2];

    let previewR = 255;
    let previewG = 255;
    let previewB = 255;

    for (let ink = 0; ink < inkCount; ink += 1) {
      const vector = inkVectors[ink];
      const density = clamp01(
        (demandR * vector[0] + demandG * vector[1] + demandB * vector[2]) / inkNorms[ink],
      );
      // Layer is a printable separation: white = no ink, black = full ink.
      const tone = clampByte(255 * (1 - density));
      const layer = layers[ink];
      layer[index] = tone;
      layer[index + 1] = tone;
      layer[index + 2] = tone;
      layer[index + 3] = 255;

      previewR -= density * vector[0];
      previewG -= density * vector[1];
      previewB -= density * vector[2];
    }

    preview[index] = clampByte(previewR);
    preview[index + 1] = clampByte(previewG);
    preview[index + 2] = clampByte(previewB);
    preview[index + 3] = 255;
  }

  const layerBuffers = layers.map((layer) => layer.buffer);
  const response: RisoResponse = {
    id,
    width,
    height,
    preview: preview.buffer,
    layers: layerBuffers,
  };
  (self as unknown as Worker).postMessage(response, [preview.buffer, ...layerBuffers]);
};
