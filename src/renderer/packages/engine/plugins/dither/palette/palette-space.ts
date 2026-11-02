import type { Palette } from "../../../core/types";
import { srgbByteToLinear } from "../../../tone/srgb-linear";
import {
  A_FROM_L, A_FROM_M, A_FROM_S, B_FROM_L, B_FROM_M, B_FROM_S, LIGHT_FROM_L, LIGHT_FROM_M, LIGHT_FROM_S,
  linearToOklab,
} from "./oklab-matrices";

const BYTE_MAX = 255;

export interface PreparedPalette {
  swatches: Float32Array;
  linear: Float32Array;
  lab: Float32Array;
  size: number;
  srgbSpread: number;
}

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
    swatches: Float32Array.from(palette.colors.flat()),
    linear,
    lab,
    size,
    srgbSpread: nearestNeighbourSpread(encoded, size),
  };
};

const probe = new Float64Array(3);

const writeProbe = (coneLong: number, coneMedium: number, coneShort: number): void => {
  const long = Math.cbrt(coneLong);
  const medium = Math.cbrt(coneMedium);
  const short = Math.cbrt(coneShort);
  probe[0] = Math.fround(LIGHT_FROM_L * long + LIGHT_FROM_M * medium + LIGHT_FROM_S * short);
  probe[1] = Math.fround(A_FROM_L * long + A_FROM_M * medium + A_FROM_S * short);
  probe[2] = Math.fround(B_FROM_L * long + B_FROM_M * medium + B_FROM_S * short);
};

const nearestToProbe = (lab: Float32Array, members: Uint32Array, start: number, end: number): number => {
  const probeL = probe[0];
  const probeA = probe[1];
  const probeB = probe[2];
  let best = members[start];
  let bestDistance = Infinity;
  for (let member = start; member < end; member++) {
    const offset = members[member] * 3;
    const dl = probeL - lab[offset];
    const lightDistance = dl * dl;
    if (lightDistance >= bestDistance) continue;
    const da = probeA - lab[offset + 1];
    const db = probeB - lab[offset + 2];
    const distance = lightDistance + da * da + db * db;
    if (distance < bestDistance) { bestDistance = distance; best = members[member]; }
  }
  return best;
};

export const nearestAmong = (
  prepared: PreparedPalette, members: Uint32Array, start: number, count: number,
  coneLong: number, coneMedium: number, coneShort: number,
): number => {
  writeProbe(coneLong, coneMedium, coneShort);
  return nearestToProbe(prepared.lab, members, start, start + count);
};
