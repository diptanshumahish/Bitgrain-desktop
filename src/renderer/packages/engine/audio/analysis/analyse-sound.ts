import { followEnvelope, normalizeEnvelope, smoothingCoefficient } from "./envelope-shaping";
import { detectOnsets } from "./onset-pulse";
import { measureSpectralFrames } from "./spectral-frames";

interface SoundAnalysisRequest {
  mono: Float32Array;
  sampleRate: number;
  startSeconds: number;
  seconds: number;
  fps: number;
}

export interface SoundEnvelopes {
  bass: Float32Array;
  mid: Float32Array;
  high: Float32Array;
  energy: Float32Array;
  beat: Float32Array;
  onsets: Uint8Array;
}

interface EnvelopeTiming {
  attackSeconds: number;
  releaseSeconds: number;
}

const BASS_TIMING: EnvelopeTiming = { attackSeconds: 0.01, releaseSeconds: 0.14 };
const MID_TIMING: EnvelopeTiming = { attackSeconds: 0.03, releaseSeconds: 0.2 };
const HIGH_TIMING: EnvelopeTiming = { attackSeconds: 0.01, releaseSeconds: 0.08 };
const ENERGY_TIMING: EnvelopeTiming = { attackSeconds: 0.12, releaseSeconds: 0.45 };

const shapeEnvelope = (raw: Float32Array, timing: EnvelopeTiming, fps: number): Float32Array =>
  normalizeEnvelope(
    followEnvelope(raw, smoothingCoefficient(timing.attackSeconds, fps), smoothingCoefficient(timing.releaseSeconds, fps)),
  );

export const analyseSound = (request: SoundAnalysisRequest): SoundEnvelopes => {
  const { fps } = request;
  const spectral = measureSpectralFrames({
    mono: request.mono,
    sampleRate: request.sampleRate,
    startSample: Math.round(request.startSeconds * request.sampleRate),
    frameCount: Math.max(1, Math.round(request.seconds * fps)),
    samplesPerFrame: request.sampleRate / fps,
  });
  const { pulse, onsets } = detectOnsets(spectral.flux, fps);
  return {
    bass: shapeEnvelope(spectral.bass, BASS_TIMING, fps),
    mid: shapeEnvelope(spectral.mid, MID_TIMING, fps),
    high: shapeEnvelope(spectral.high, HIGH_TIMING, fps),
    energy: shapeEnvelope(spectral.rms, ENERGY_TIMING, fps),
    beat: pulse,
    onsets,
  };
};
