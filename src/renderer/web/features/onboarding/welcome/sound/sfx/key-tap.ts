import { playTone } from "../instruments/tone";
import { playNoiseBurst } from "../instruments/noise-burst";

const TAP = { seconds: 0.01, bandHz: 3000, q: 2, gain: 0.09 };
const PING = { hz: 1500, gain: 0.018, attackS: 0.001, decayS: 0.025 };
const PITCH_SPREAD = 0.3;

const varied = (value: number): number => value * (1 - PITCH_SPREAD / 2 + Math.random() * PITCH_SPREAD);

export const playKeyTap = (context: AudioContext, output: AudioNode): void => {
  const startAt = context.currentTime;
  playNoiseBurst(context, output, { ...TAP, bandHz: varied(TAP.bandHz), startAt });
  playTone(context, output, {
    wave: "sine",
    frequency: varied(PING.hz),
    startAt,
    peakGain: PING.gain,
    attackSeconds: PING.attackS,
    decaySeconds: PING.decayS,
  });
};
