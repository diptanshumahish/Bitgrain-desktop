interface ToneBand {
  edge: number;
  coverage: number;
}

interface MangaToneMap {
  blackEdge: number;
  screenBands: ToneBand[];
}

const MIN_GRADIENT = 0.0001;
const HALF = 0.5;

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

export const buildToneMap = (contrast: number): MangaToneMap => ({
  blackEdge: lerp(0.08, 0.2, contrast),
  screenBands: [
    { edge: lerp(0.3, 0.38, contrast), coverage: 0.58 },
    { edge: lerp(0.5, 0.56, contrast), coverage: 0.34 },
    { edge: lerp(0.7, 0.74, contrast), coverage: 0.15 },
  ],
});

export const screenCoverageForTone = (tone: number, toneMap: MangaToneMap): number => {
  const band = toneMap.screenBands.find((candidate) => tone < candidate.edge);
  return band ? band.coverage : 0;
};

export const blackForTone = (tone: number, gradient: number, toneMap: MangaToneMap): number => {
  const coverage = (toneMap.blackEdge - tone) / Math.max(MIN_GRADIENT, gradient) + HALF;
  return Math.min(1, Math.max(0, coverage));
};
