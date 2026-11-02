import { fract } from "../shared/glass-math";

const EDGE_LIMIT = 0.995;
const PRISM_SLOPE = 1.2;
const WAVE_SLOPE = Math.PI * 0.5;
const PLEAT_SLOPE = 2.2;
const FLAT_SLOPE = 0.6;
const FLAT_POWER = 3;
const IRREGULAR_AMOUNT = 0.45;
const IRREGULAR_SLOW = 0.5;
const IRREGULAR_FAST = 1.7;
const WAVE_AMOUNT = 1.6;
const WAVE_RATE = 0.12;
const ZIGZAG_AMOUNT = 4;
const ZIGZAG_RATE = 0.05;
const HALF = 0.5;

export type SlopeProfile = (position: number) => number;
export type GridCurve = (across: number, along: number) => number;

const roundSlope: SlopeProfile = (position) => {
  const centred = Math.max(-EDGE_LIMIT, Math.min(EDGE_LIMIT, 2 * position - 1));
  return -centred / Math.sqrt(1 - centred * centred);
};

const prismSlope: SlopeProfile = (position) => (position < HALF ? PRISM_SLOPE : -PRISM_SLOPE);

const waveSlope: SlopeProfile = (position) => -WAVE_SLOPE * Math.sin(2 * Math.PI * position);

const pleatSlope: SlopeProfile = (position) => PLEAT_SLOPE * position;

const flatSlope: SlopeProfile = (position) => -FLAT_SLOPE * (2 * position - 1) ** FLAT_POWER;

export const SLOPE_PROFILES: Readonly<Record<string, SlopeProfile>> = {
  round: roundSlope, prism: prismSlope, wave: waveSlope, pleat: pleatSlope, flat: flatSlope,
};

const straightCurve: GridCurve = () => 0;

const irregularCurve: GridCurve = (across) =>
  IRREGULAR_AMOUNT * Math.sin(IRREGULAR_SLOW * across) * Math.sin(IRREGULAR_FAST * across);

const wavyCurve: GridCurve = (_across, along) => WAVE_AMOUNT * Math.sin(WAVE_RATE * along);

const zigzagCurve: GridCurve = (_across, along) => ZIGZAG_AMOUNT * Math.abs(fract(ZIGZAG_RATE * along) - HALF);

export const GRID_CURVES: Readonly<Record<string, GridCurve>> = {
  straight: straightCurve, irregular: irregularCurve, wavy: wavyCurve, zigzag: zigzagCurve,
};

export const snellOffset = (slope: number, inverseIndex: number, thickness: number): number => {
  const incidence = Math.atan(slope);
  const bent = Math.asin(Math.sin(incidence) * inverseIndex);
  return -Math.tan(incidence - bent) * thickness;
};
