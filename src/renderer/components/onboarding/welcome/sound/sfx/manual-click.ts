import { playTone } from "../instruments/tone";
import { playNoiseBurst } from "../instruments/noise-burst";

const BUBBLE = { startHz: 620, endHz: 310, sweepS: 0.03, gain: 0.14, attackS: 0.003, decayS: 0.09 };
const BODY = { hz: 196, gain: 0.08, attackS: 0.004, decayS: 0.07 };
const TICK = { seconds: 0.005, bandHz: 1900, q: 1, gain: 0.04 };

export const playManualClick = (context: AudioContext, output: AudioNode): void => {
  const startAt = context.currentTime;
  playTone(context, output, {
    wave: "sine",
    frequency: BUBBLE.startHz,
    endFrequency: BUBBLE.endHz,
    sweepSeconds: BUBBLE.sweepS,
    startAt,
    peakGain: BUBBLE.gain,
    attackSeconds: BUBBLE.attackS,
    decaySeconds: BUBBLE.decayS,
  });
  playTone(context, output, { wave: "triangle", frequency: BODY.hz, startAt, peakGain: BODY.gain, attackSeconds: BODY.attackS, decaySeconds: BODY.decayS });
  playNoiseBurst(context, output, { ...TICK, startAt });
};
