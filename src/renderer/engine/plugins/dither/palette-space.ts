import type { Palette } from "../../types";
import { srgbByteToLinear } from "../../tone/srgb-linear";

const BYTE_MAX = 255;

export interface PreparedPalette {
  srgb: [number, number, number][];
  linear: Float32Array;
  lab: Float32Array;
  size: number;
  srgbSpread: number;
}

const OKLAB_M1 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];
const OKLAB_M2 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

export const linearToOklab = (red: number, green: number, blue: number, out: Float32Array, offset: number): void => {
  const long = Math.cbrt(Math.max(0, OKLAB_M1[0][0] * red + OKLAB_M1[0][1] * green + OKLAB_M1[0][2] * blue));
  const medium = Math.cbrt(Math.max(0, OKLAB_M1[1][0] * red + OKLAB_M1[1][1] * green + OKLAB_M1[1][2] * blue));
  const short = Math.cbrt(Math.max(0, OKLAB_M1[2][0] * red + OKLAB_M1[2][1] * green + OKLAB_M1[2][2] * blue));
  for (let axis = 0; axis < 3; axis++) {
    out[offset + axis] = OKLAB_M2[axis][0] * long + OKLAB_M2[axis][1] * medium + OKLAB_M2[axis][2] * short;
  }
};

const nearestNeighbourSpread = (coords: Float32Array, size: number): number => {
  if (size < 2) return 1;
  let total = 0;
  for (let first = 0; first < size; first++) {
    let closest = Infinity;
    for (let second = 0; second < size; second++) {
      if (first === second) continue;
      let distance = 0;
      for (let axis = 0; axis < 3; axis++) distance += (coords[first * 3 + axis] - coords[second * 3 + axis]) ** 2;
      closest = Math.min(closest, Math.sqrt(distance));
    }
    total += closest;
  }
  return total / size;
};

export const preparePalette = (palette: Palette): PreparedPalette => {
  const size = palette.colors.length;
  const linear = new Float32Array(size * 3);
  const lab = new Float32Array(size * 3);
  const encoded = new Float32Array(size * 3);
  palette.colors.forEach((color, index) => {
    for (let axis = 0; axis < 3; axis++) {
      linear[index * 3 + axis] = srgbByteToLinear(color[axis]);
      encoded[index * 3 + axis] = color[axis] / BYTE_MAX;
    }
    linearToOklab(linear[index * 3], linear[index * 3 + 1], linear[index * 3 + 2], lab, index * 3);
  });
  return {
    srgb: palette.colors,
    linear,
    lab,
    size,
    srgbSpread: nearestNeighbourSpread(encoded, size),
  };
};

const probe = new Float32Array(3);

export const nearestPaletteIndex = (prepared: PreparedPalette, red: number, green: number, blue: number): number => {
  linearToOklab(red, green, blue, probe, 0);
  let best = 0;
  let bestDistance = Infinity;
  for (let index = 0; index < prepared.size; index++) {
    const dl = probe[0] - prepared.lab[index * 3];
    const da = probe[1] - prepared.lab[index * 3 + 1];
    const db = probe[2] - prepared.lab[index * 3 + 2];
    const distance = dl * dl + da * da + db * db;
    if (distance < bestDistance) { bestDistance = distance; best = index; }
  }
  return best;
};
