import type { ParamValues } from "../../../engine/style-types";
import type { WarpMapper, WarpPoint } from "./warp-sampler";
import { fraction, warpCentre, WARP_KEYS, type WarpGeometry } from "./warp-spec";

const MIN_DISTANCE = 1e-3;
const SPHERIZE_GAIN = 0.7;
const TWIRL_TURNS = 1.5 * Math.PI;
const MAX_BULGE = 0.92;

const radialProfile = (ratio: number, exponent: number): number => {
  if (exponent >= 1) return Math.pow(ratio, exponent);
  const bulge = Math.min(MAX_BULGE, 1 - exponent);
  return ratio * (1 - bulge * (1 - ratio * ratio));
};

const identity = (x: number, y: number, point: WarpPoint): void => {
  point.x = x;
  point.y = y;
};

const powerWarp = (values: ParamValues, geometry: WarpGeometry, exponent: number): WarpMapper => {
  const { centreX, centreY, radius } = warpCentre(values, geometry);
  return {
    map: (x, y, point) => {
      const offsetX = x - centreX;
      const offsetY = y - centreY;
      const distance = Math.hypot(offsetX, offsetY);
      const ratio = distance / radius;
      if (ratio >= 1 || distance < MIN_DISTANCE) return identity(x, y, point);
      const stretch = (radialProfile(ratio, exponent) * radius) / distance;
      point.x = centreX + offsetX * stretch;
      point.y = centreY + offsetY * stretch;
    },
  };
};

export const pinchWarp = (values: ParamValues, geometry: WarpGeometry): WarpMapper =>
  powerWarp(values, geometry, 1 + fraction(values, WARP_KEYS.amount));

export const spherizeWarp = (values: ParamValues, geometry: WarpGeometry): WarpMapper =>
  powerWarp(values, geometry, 1 - SPHERIZE_GAIN * fraction(values, WARP_KEYS.amount));

export const twirlWarp = (values: ParamValues, geometry: WarpGeometry): WarpMapper => {
  const { centreX, centreY, radius } = warpCentre(values, geometry);
  const twist = fraction(values, WARP_KEYS.amount) * TWIRL_TURNS;
  return {
    map: (x, y, point) => {
      const offsetX = x - centreX;
      const offsetY = y - centreY;
      const distance = Math.hypot(offsetX, offsetY);
      const ratio = distance / radius;
      if (ratio >= 1) return identity(x, y, point);
      const angle = Math.atan2(offsetY, offsetX) - twist * (1 - ratio);
      point.x = centreX + distance * Math.cos(angle);
      point.y = centreY + distance * Math.sin(angle);
    },
  };
};
