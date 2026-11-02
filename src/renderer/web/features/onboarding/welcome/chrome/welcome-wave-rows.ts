import type { WaveRow } from "../../../landing/marketing/marine/wave/hand-drawn-wave";

export const WAVES_WIDTH = 1440;
export const WAVES_TOP = 18;
export const WAVES_HEIGHT = 114;
export const WAVES_FLOOR = 160;
export const WAVE_STROKE_WIDTHS = [9, 10.5];

export const WAVE_ROWS: WaveRow[] = [
  { start: -80, end: 1520, baseline: 38, amplitude: 9, wavelength: 92, phase: 0.4, drift: 2 },
  { start: -100, end: 1520, baseline: 70, amplitude: 10, wavelength: 98, phase: 2.1, drift: 2.5 },
];

export const SHORE_ROW: WaveRow = {
  start: -80, end: 1520, baseline: 104, amplitude: 10, wavelength: 90, phase: 4.3, drift: 2,
};

export const progressRow = (index: number): WaveRow => ({
  start: 2, end: 34, baseline: 6, amplitude: 2, wavelength: 10, phase: index * 1.3, drift: 0.4,
});
