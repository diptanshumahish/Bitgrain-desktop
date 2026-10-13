import { playSynthVoice } from "../instruments/synth-voice";
import { STEP_SECONDS } from "../arrangement";

const RISER = {
  wave: "sawtooth" as OscillatorType,
  frequency: 110,
  detuneCents: [-10, 10],
  attackSeconds: 0.35,
  holdSeconds: 0.05,
  releaseSeconds: 0.9,
  peakGain: 0.035,
  filterFromHz: 180,
  filterToHz: 4200,
  filterSeconds: 0.45,
  resonance: 9,
};

const PING = {
  wave: "square" as OscillatorType,
  frequency: 659.25,
  detuneCents: [0],
  attackSeconds: 0.005,
  holdSeconds: 0.02,
  releaseSeconds: 0.7,
  peakGain: 0.03,
  filterFromHz: 3000,
  filterToHz: 700,
  filterSeconds: 0.4,
  resonance: 6,
};

const PING_DELAY_STEPS = 4;

export const playTransitionBling = (context: AudioContext, output: AudioNode, startAt: number): void => {
  playSynthVoice(context, output, { ...RISER, startAt });
  playSynthVoice(context, output, { ...PING, startAt: startAt + STEP_SECONDS * PING_DELAY_STEPS });
};
