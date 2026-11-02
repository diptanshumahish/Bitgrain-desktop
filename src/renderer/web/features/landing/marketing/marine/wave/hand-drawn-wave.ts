export interface WaveRow {
  start: number;
  end: number;
  baseline: number;
  amplitude: number;
  wavelength: number;
  phase: number;
  drift: number;
}

const LENGTH_WOBBLE = 0.18;
const HEIGHT_WOBBLE = 0.24;
const LENGTH_RATE = 1.7;
const HEIGHT_RATE = 2.3;
const DRIFT_RATE = 0.6;
const PRECISION = 10;

const round = (value: number): number => Math.round(value * PRECISION) / PRECISION;

export const buildWavePath = (row: WaveRow): string => {
  const segments: string[] = [`M ${row.start} ${row.baseline}`];
  let cursor = row.start;
  for (let index = 0; cursor < row.end; index += 1) {
    const halfLength = (row.wavelength / 2) * (1 + Math.sin(index * LENGTH_RATE + row.phase) * LENGTH_WOBBLE);
    const direction = index % 2 === 0 ? -1 : 1;
    const height = row.amplitude * (1 + Math.cos(index * HEIGHT_RATE + row.phase) * HEIGHT_WOBBLE) * direction;
    const lift = Math.sin(index * DRIFT_RATE + row.phase) * row.drift;
    const nextCursor = cursor + halfLength;
    segments.push(`Q ${round(cursor + halfLength / 2)} ${round(row.baseline + height * 2 + lift)} ${round(nextCursor)} ${round(row.baseline + lift)}`);
    cursor = nextCursor;
  }
  return segments.join(" ");
};

export const buildShorePath = (row: WaveRow, floor: number): string =>
  `${buildWavePath(row)} L ${row.end + row.wavelength} ${floor} L ${row.start} ${floor} Z`;
