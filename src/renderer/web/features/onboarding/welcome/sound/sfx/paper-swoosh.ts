import { playTone } from "../instruments/tone";

const SWOOSH = { seconds: 0.5, fromHz: 450, toHz: 3200, sweepShare: 0.8, q: 1.1, gain: 0.24 };
const RISE_POWER = 0.6;
const FALL_POWER = 1.4;
const VARIATION = 0.3;

const varied = (value: number): number => value * (1 - VARIATION / 2 + Math.random() * VARIATION);

const LAND = { startHz: 150, endHz: 70, sweepS: 0.1, gain: 0.07, attackS: 0.004, decayS: 0.16, atShare: 0.7 };

const swooshEnvelope = (position: number): number => position ** RISE_POWER * (1 - position) ** FALL_POWER;

const buildSwooshBuffer = (context: AudioContext): AudioBuffer => {
  const length = Math.floor(context.sampleRate * SWOOSH.seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) samples[index] = (Math.random() * 2 - 1) * swooshEnvelope(index / length);
  return buffer;
};

const playLanding = (context: AudioContext, output: AudioNode, startAt: number): void => {
  playTone(context, output, {
    wave: "sine",
    frequency: varied(LAND.startHz),
    endFrequency: LAND.endHz,
    sweepSeconds: LAND.sweepS,
    startAt: startAt + SWOOSH.seconds * LAND.atShare,
    peakGain: LAND.gain,
    attackSeconds: LAND.attackS,
    decaySeconds: LAND.decayS,
  });
};

export const playPaperSwoosh = (context: AudioContext, output: AudioNode, startAt: number): void => {
  const source = context.createBufferSource();
  const band = context.createBiquadFilter();
  const level = context.createGain();
  source.buffer = buildSwooshBuffer(context);
  band.type = "bandpass";
  band.Q.value = SWOOSH.q;
  band.frequency.setValueAtTime(varied(SWOOSH.fromHz), startAt);
  band.frequency.exponentialRampToValueAtTime(varied(SWOOSH.toHz), startAt + SWOOSH.seconds * SWOOSH.sweepShare);
  level.gain.value = varied(SWOOSH.gain);
  source.connect(band).connect(level).connect(output);
  source.start(startAt);
  playLanding(context, output, startAt);
};
