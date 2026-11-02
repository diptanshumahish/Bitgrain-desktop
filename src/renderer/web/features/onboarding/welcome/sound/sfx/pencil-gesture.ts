export interface InkGesture {
  strokeMs: number[];
  turnsPerStroke: number;
}

export interface PencilVoice {
  pressure: number;
  grainSamples: number;
  turnDepth: number;
}

const PEN_DOWN_S = 0.012;
const PEN_UP_S = 0.04;
const MIN_GRAIN_LEVEL = 0.6;
const GRAIN_GLIDE = 0.004;
const NOISE_WARMTH = 0.55;
const FIBER_CHANCE = 0.0008;
const FIBER_BOOST = 2.2;
const MS_PER_SECOND = 1000;

export const turnCurve = (position: number, turns: number, depth: number): number =>
  1 - depth + depth * Math.abs(Math.sin(Math.PI * (turns + 0.5) * position));

const strokeEdge = (offsetS: number, lengthS: number): number =>
  Math.min(1, offsetS / PEN_DOWN_S, (lengthS - offsetS) / PEN_UP_S);

const fillStroke = (samples: Float32Array, sampleRate: number, start: number, length: number, gesture: InkGesture, voice: PencilVoice): void => {
  let grainTarget = 1;
  let grain = 1;
  let noise = 0;
  const end = Math.min(samples.length, start + length);
  for (let index = start; index < end; index += 1) {
    const offset = index - start;
    if (offset % voice.grainSamples === 0) grainTarget = MIN_GRAIN_LEVEL + Math.random() * (1 - MIN_GRAIN_LEVEL);
    grain += (grainTarget - grain) * GRAIN_GLIDE;
    noise = noise * NOISE_WARMTH + (Math.random() * 2 - 1) * (1 - NOISE_WARMTH);
    const fiber = Math.random() < FIBER_CHANCE ? FIBER_BOOST : 1;
    const shape = strokeEdge(offset / sampleRate, length / sampleRate) * turnCurve(offset / length, gesture.turnsPerStroke, voice.turnDepth);
    samples[index] = noise * fiber * voice.pressure * grain * Math.max(0, shape);
  }
};

export const fillGesture = (samples: Float32Array, sampleRate: number, gesture: InkGesture, voice: PencilVoice): void => {
  let start = 0;
  for (const strokeMs of gesture.strokeMs) {
    const length = Math.floor((strokeMs / MS_PER_SECOND) * sampleRate);
    fillStroke(samples, sampleRate, start, length, gesture, voice);
    start += length;
  }
};

export const gestureSeconds = (gesture: InkGesture): number =>
  gesture.strokeMs.reduce((total, strokeMs) => total + strokeMs, 0) / MS_PER_SECOND;
