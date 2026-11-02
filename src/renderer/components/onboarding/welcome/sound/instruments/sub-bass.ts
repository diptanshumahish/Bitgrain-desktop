import { playSynthVoice } from "./synth-voice";

const SUB_VOICE = {
  wave: "square" as OscillatorType,
  detuneCents: [0],
  attackSeconds: 0.08,
  releaseSeconds: 0.6,
  peakGain: 0.07,
  filterFromHz: 260,
  filterToHz: 180,
  filterSeconds: 0.8,
  resonance: 2,
};

export const playSubBass = (context: AudioContext, output: AudioNode, frequency: number, startAt: number, lengthSeconds: number): void => {
  const holdSeconds = Math.max(0, lengthSeconds - SUB_VOICE.attackSeconds - SUB_VOICE.releaseSeconds / 2);
  playSynthVoice(context, output, { ...SUB_VOICE, frequency, startAt, holdSeconds });
};
