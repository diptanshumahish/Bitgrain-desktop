import { fillGesture, gestureSeconds, turnCurve, type InkGesture, type PencilVoice } from "./pencil-gesture";

const HIGHPASS_HZ = 900;
const SOFTEN_HZ = 5200;
const PRESENCE_DB = 3;
const PRESENCE_BASE_HZ = 2800;
const PRESENCE_SPREAD = 0.35;
const BRIGHTNESS_SWING = 0.25;
const CURVE_POINTS = 64;
const BASE_GAIN = 0.05;
const GAIN_SPREAD = 0.3;
const PAN_SPREAD = 0.3;
const GRAIN_MIN_SAMPLES = 160;
const GRAIN_SPREAD_SAMPLES = 320;
const TURN_DEPTH_MIN = 0.35;
const TURN_DEPTH_SPREAD = 0.35;

const spread = (base: number, amount: number): number => base * (1 - amount / 2 + Math.random() * amount);

const randomVoice = (): PencilVoice => ({
  pressure: spread(1, GAIN_SPREAD),
  grainSamples: Math.floor(GRAIN_MIN_SAMPLES + Math.random() * GRAIN_SPREAD_SAMPLES),
  turnDepth: TURN_DEPTH_MIN + Math.random() * TURN_DEPTH_SPREAD,
});

const brightnessCurve = (gesture: InkGesture, voice: PencilVoice, centerHz: number): Float32Array => {
  const curve = new Float32Array(CURVE_POINTS * gesture.strokeMs.length);
  for (let index = 0; index < curve.length; index += 1) {
    const position = (index % CURVE_POINTS) / CURVE_POINTS;
    curve[index] = centerHz * (1 - BRIGHTNESS_SWING + BRIGHTNESS_SWING * turnCurve(position, gesture.turnsPerStroke, voice.turnDepth));
  }
  return curve;
};

const createPaperChain = (context: AudioContext, startAt: number, gesture: InkGesture, voice: PencilVoice): AudioNode[] => {
  const highpass = context.createBiquadFilter();
  const presence = context.createBiquadFilter();
  const soften = context.createBiquadFilter();
  const level = context.createGain();
  const pan = context.createStereoPanner();
  highpass.type = "highpass";
  highpass.frequency.value = HIGHPASS_HZ;
  soften.type = "lowpass";
  soften.frequency.value = SOFTEN_HZ;
  presence.type = "peaking";
  presence.gain.value = PRESENCE_DB;
  presence.frequency.setValueCurveAtTime(brightnessCurve(gesture, voice, spread(PRESENCE_BASE_HZ, PRESENCE_SPREAD)), startAt, gestureSeconds(gesture));
  level.gain.value = BASE_GAIN;
  pan.pan.value = (Math.random() - 0.5) * PAN_SPREAD;
  return [highpass, presence, soften, level, pan];
};

export const playPencilScribble = (context: AudioContext, output: AudioNode, startAt: number, gesture: InkGesture): void => {
  const voice = randomVoice();
  const buffer = context.createBuffer(1, Math.max(1, Math.ceil(gestureSeconds(gesture) * context.sampleRate)), context.sampleRate);
  fillGesture(buffer.getChannelData(0), context.sampleRate, gesture, voice);
  const source = context.createBufferSource();
  source.buffer = buffer;
  const chain = createPaperChain(context, startAt, gesture, voice);
  chain.reduce<AudioNode>((previous, node) => previous.connect(node), source).connect(output);
  source.start(startAt);
};
