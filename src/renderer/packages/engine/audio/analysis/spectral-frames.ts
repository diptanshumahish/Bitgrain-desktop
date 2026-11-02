import { hannWindow, magnitudeSpectrum } from "./fft";

interface SpectralRequest {
  mono: Float32Array;
  sampleRate: number;
  startSample: number;
  frameCount: number;
  samplesPerFrame: number;
}

interface SpectralFrames {
  bass: Float32Array;
  mid: Float32Array;
  high: Float32Array;
  flux: Float32Array;
  rms: Float32Array;
}

interface BinRange {
  first: number;
  last: number;
}

const WINDOW_SIZE = 2048;
const BASS_HZ = { low: 30, high: 150 };
const MID_HZ = { low: 150, high: 2000 };
const HIGH_HZ = { low: 2000, high: 12000 };
const FLUX_HZ = { low: 30, high: 4000 };
const FLUX_COMPRESSION = 1000;

const binRange = (hz: { low: number; high: number }, sampleRate: number): BinRange => {
  const binHz = sampleRate / WINDOW_SIZE;
  const lastBin = WINDOW_SIZE / 2 - 1;
  return {
    first: Math.max(1, Math.round(hz.low / binHz)),
    last: Math.min(lastBin, Math.max(1, Math.round(hz.high / binHz))),
  };
};

const bandMean = (magnitudes: Float32Array, range: BinRange): number => {
  let total = 0;
  for (let bin = range.first; bin <= range.last; bin++) total += magnitudes[bin];
  return total / (range.last - range.first + 1);
};

const compressedFlux = (current: Float32Array, previous: Float32Array | null, range: BinRange): number => {
  if (!previous) return 0;
  let flux = 0;
  for (let bin = range.first; bin <= range.last; bin++) {
    const rise = Math.log1p(current[bin] * FLUX_COMPRESSION) - Math.log1p(previous[bin] * FLUX_COMPRESSION);
    if (rise > 0) flux += rise;
  }
  return flux;
};

const rmsAround = (mono: Float32Array, center: number, span: number): number => {
  const first = Math.round(center - span / 2);
  let total = 0;
  for (let index = first; index < first + span; index++) total += (mono[index] ?? 0) ** 2;
  return Math.sqrt(total / Math.max(1, span));
};

const emptyFrames = (count: number): SpectralFrames => ({
  bass: new Float32Array(count),
  mid: new Float32Array(count),
  high: new Float32Array(count),
  flux: new Float32Array(count),
  rms: new Float32Array(count),
});

export const measureSpectralFrames = (request: SpectralRequest): SpectralFrames => {
  const window = hannWindow(WINDOW_SIZE);
  const ranges = [BASS_HZ, MID_HZ, HIGH_HZ, FLUX_HZ].map((hz) => binRange(hz, request.sampleRate));
  const frames = emptyFrames(request.frameCount);
  let previous: Float32Array | null = null;
  for (let frame = 0; frame < request.frameCount; frame++) {
    const center = request.startSample + (frame + 0.5) * request.samplesPerFrame;
    const magnitudes = magnitudeSpectrum(request.mono, center, window);
    frames.bass[frame] = bandMean(magnitudes, ranges[0]);
    frames.mid[frame] = bandMean(magnitudes, ranges[1]);
    frames.high[frame] = bandMean(magnitudes, ranges[2]);
    frames.flux[frame] = compressedFlux(magnitudes, previous, ranges[3]);
    frames.rms[frame] = rmsAround(request.mono, center, request.samplesPerFrame);
    previous = magnitudes;
  }
  return frames;
};
