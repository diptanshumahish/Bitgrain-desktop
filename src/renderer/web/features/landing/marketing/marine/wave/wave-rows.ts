import type { WaveRow } from "./hand-drawn-wave";

export const BAND_WIDTH = 1440;
export const BAND_HEIGHT = 150;
export const BAND_FILL_OVERHANG = 24;

export const BAND_ROWS: WaveRow[] = [
  { start: -60, end: 1500, baseline: 40, amplitude: 12, wavelength: 92, phase: 0.4, drift: 2.5 },
  { start: -80, end: 1500, baseline: 79, amplitude: 13, wavelength: 98, phase: 2.1, drift: 3 },
];

export const BAND_STROKE_WIDTHS = [11, 12.5];

export const BAND_SHORE_ROW: WaveRow = {
  start: -60, end: 1500, baseline: 119, amplitude: 12, wavelength: 90, phase: 4.3, drift: 2,
};

export const MARK_ROW: WaveRow = { start: 4, end: 54, baseline: 11, amplitude: 4.5, wavelength: 17, phase: 1.2, drift: 0.8 };

export const SHORE_HEIGHT = 72;

export const SHORE_ROW: WaveRow = {
  start: -60, end: 1500, baseline: 40, amplitude: 16, wavelength: 180, phase: 0.9, drift: 4,
};
