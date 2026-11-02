import { playTone } from "../instruments/tone";
import { playNoiseBurst } from "../instruments/noise-burst";

const RELEASE_DELAY_S = 0.075;

interface ClickPart {
  bandHz: number;
  noiseGain: number;
  pingHz: number;
  pingGain: number;
}

const PRESS: ClickPart = { bandHz: 4200, noiseGain: 0.24, pingHz: 2600, pingGain: 0.05 };
const RELEASE: ClickPart = { bandHz: 3500, noiseGain: 0.15, pingHz: 2300, pingGain: 0.03 };
const NOISE_SECONDS = 0.006;
const NOISE_Q = 2.5;
const PING_ATTACK_S = 0.001;
const PING_DECAY_S = 0.02;

const playPart = (context: AudioContext, output: AudioNode, part: ClickPart, startAt: number): void => {
  playNoiseBurst(context, output, { startAt, seconds: NOISE_SECONDS, bandHz: part.bandHz, q: NOISE_Q, gain: part.noiseGain });
  playTone(context, output, {
    wave: "sine",
    frequency: part.pingHz,
    startAt,
    peakGain: part.pingGain,
    attackSeconds: PING_ATTACK_S,
    decaySeconds: PING_DECAY_S,
  });
};

export const playMouseClick = (context: AudioContext, output: AudioNode): void => {
  const startAt = context.currentTime;
  playPart(context, output, PRESS, startAt);
  playPart(context, output, RELEASE, startAt + RELEASE_DELAY_S);
};
