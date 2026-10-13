import { playSynthVoice } from "./synth-voice";

const PAD_VOICE = {
  wave: "sawtooth" as OscillatorType,
  detuneCents: [-12, 0, 12],
  attackSeconds: 1.2,
  releaseSeconds: 1.6,
  peakGain: 0.022,
  filterFromHz: 300,
  filterToHz: 700,
  filterSeconds: 2.2,
  resonance: 1.2,
};

export const playPadChord = (context: AudioContext, output: AudioNode, tones: number[], startAt: number, lengthSeconds: number): void => {
  const holdSeconds = Math.max(0, lengthSeconds - PAD_VOICE.attackSeconds);
  for (const frequency of tones) playSynthVoice(context, output, { ...PAD_VOICE, frequency, startAt, holdSeconds });
};
