import { playSynthVoice } from "./synth-voice";

const ARP_VOICE = {
  wave: "triangle" as OscillatorType,
  detuneCents: [-4, 4],
  attackSeconds: 0.003,
  holdSeconds: 0.02,
  releaseSeconds: 0.5,
  peakGain: 0.05,
  filterFromHz: 2400,
  filterToHz: 600,
  filterSeconds: 0.18,
  resonance: 1.5,
};

export const playArpNote = (context: AudioContext, output: AudioNode, frequency: number, startAt: number): void => {
  playSynthVoice(context, output, { ...ARP_VOICE, frequency, startAt });
};
