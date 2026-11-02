import type { ParamValues } from "../../../engine/style-types";
import { numberParam } from "../../../engine/resolve-params";
import type { WarpMapper } from "./warp-sampler";
import { fraction, warpCentre, WARP_KEYS, type WarpGeometry } from "./warp-spec";

const FULL_TURN = Math.PI * 2;
const WAVE_AMPLITUDE = 0.04;
const WAVE_LENGTH_GAIN = 0.25;
const MIN_WAVE_LENGTH = 6;
const RING_AMPLITUDE = 22;
const MIN_DISTANCE = 1e-3;
const SHEAR_AMPLITUDE = 0.18;
const MIN_SHEAR_CYCLES = 0.25;

const sineTable = (length: number, amplitude: number, frequency: number): Float32Array => {
  const table = new Float32Array(length);
  for (let index = 0; index < length; index++) table[index] = amplitude * Math.sin(frequency * index);
  return table;
};

export const zigzagWaveWarp = (values: ParamValues, geometry: WarpGeometry): WarpMapper => {
  const shortSide = Math.min(geometry.width, geometry.height);
  const amplitude = fraction(values, WARP_KEYS.amount) * shortSide * WAVE_AMPLITUDE;
  const waveLength = Math.max(MIN_WAVE_LENGTH, fraction(values, WARP_KEYS.wavelength) * shortSide * WAVE_LENGTH_GAIN);
  const frequency = FULL_TURN / waveLength;
  const shiftByRow = sineTable(geometry.height, amplitude, frequency);
  const shiftByColumn = sineTable(geometry.width, amplitude, frequency);
  return {
    map: (x, y, point) => {
      point.x = x + shiftByRow[y];
      point.y = y + shiftByColumn[x];
    },
  };
};

export const rippleRingsWarp = (values: ParamValues, geometry: WarpGeometry): WarpMapper => {
  const { centreX, centreY, radius } = warpCentre(values, geometry);
  const amplitude = fraction(values, WARP_KEYS.amount) * RING_AMPLITUDE * geometry.scale;
  const rings = Math.max(1, Math.round(numberParam(values, WARP_KEYS.rings)));
  const frequency = (Math.PI * rings) / radius;
  return {
    map: (x, y, point) => {
      const offsetX = x - centreX;
      const offsetY = y - centreY;
      const distance = Math.max(MIN_DISTANCE, Math.hypot(offsetX, offsetY));
      const stretch = (distance + amplitude * Math.sin(frequency * distance)) / distance;
      point.x = centreX + offsetX * stretch;
      point.y = centreY + offsetY * stretch;
    },
  };
};

export const shearWarp = (values: ParamValues, geometry: WarpGeometry): WarpMapper => {
  const amplitude = fraction(values, WARP_KEYS.amount) * geometry.width * SHEAR_AMPLITUDE;
  const cycles = Math.max(MIN_SHEAR_CYCLES, fraction(values, WARP_KEYS.period));
  const shiftByRow = sineTable(geometry.height, amplitude, (FULL_TURN * cycles) / geometry.height);
  return {
    map: (x, y, point) => {
      point.x = x - shiftByRow[y];
      point.y = y;
    },
  };
};
