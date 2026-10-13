import { playTone } from "./tone";
import { STEP_SECONDS } from "../arrangement";

const BEAT = { startHz: 95, endHz: 42, sweepS: 0.14, gain: 0.16, attackS: 0.006, decayS: 0.38 };
const SECOND_BEAT_GAP_S = STEP_SECONDS * 1.5;
const SECOND_BEAT_LEVEL = 0.6;

const playThump = (context: AudioContext, output: AudioNode, startAt: number, level: number): void => {
  playTone(context, output, {
    wave: "sine",
    frequency: BEAT.startHz,
    endFrequency: BEAT.endHz,
    sweepSeconds: BEAT.sweepS,
    startAt,
    peakGain: BEAT.gain * level,
    attackSeconds: BEAT.attackS,
    decaySeconds: BEAT.decayS,
  });
};

export const playHeartbeat = (context: AudioContext, output: AudioNode, startAt: number): void => {
  playThump(context, output, startAt, 1);
  playThump(context, output, startAt + SECOND_BEAT_GAP_S, SECOND_BEAT_LEVEL);
};
