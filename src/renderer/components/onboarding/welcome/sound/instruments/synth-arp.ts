import { playSynthVoice } from "./synth-voice";

const ARP_VOICE = {
  wave: "sawtooth" as OscillatorType,
  detuneCents: [-7, 7],
  attackSeconds: 0.004,
  holdSeconds: 0.03,
  releaseSeconds: 0.38,
  peakGain: 0.038,
  filterFromHz: 1300,
  filterToHz: 380,
  filterSeconds: 0.22,
  resonance: 3.5,
};

export const playArpNote = (context: AudioContext, output: AudioNode, frequency: number, startAt: number): void => {
  playSynthVoice(context, output, { ...ARP_VOICE, frequency, startAt });
};
