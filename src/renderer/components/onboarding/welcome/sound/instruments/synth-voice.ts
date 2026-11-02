const SILENT_GAIN = 0.0001;
const STOP_PADDING_S = 0.05;

export interface SynthVoice {
  wave: OscillatorType;
  frequency: number;
  detuneCents: number[];
  startAt: number;
  attackSeconds: number;
  holdSeconds: number;
  releaseSeconds: number;
  peakGain: number;
  filterFromHz: number;
  filterToHz: number;
  filterSeconds: number;
  resonance: number;
}

const createVoiceFilter = (context: AudioContext, voice: SynthVoice): BiquadFilterNode => {
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = voice.resonance;
  filter.frequency.setValueAtTime(voice.filterFromHz, voice.startAt);
  filter.frequency.exponentialRampToValueAtTime(voice.filterToHz, voice.startAt + voice.filterSeconds);
  return filter;
};

const createVoiceEnvelope = (context: AudioContext, voice: SynthVoice): GainNode => {
  const envelope = context.createGain();
  const releaseAt = voice.startAt + voice.attackSeconds + voice.holdSeconds;
  envelope.gain.setValueAtTime(SILENT_GAIN, voice.startAt);
  envelope.gain.linearRampToValueAtTime(voice.peakGain, voice.startAt + voice.attackSeconds);
  envelope.gain.setValueAtTime(voice.peakGain, releaseAt);
  envelope.gain.exponentialRampToValueAtTime(SILENT_GAIN, releaseAt + voice.releaseSeconds);
  return envelope;
};

export const playSynthVoice = (context: AudioContext, output: AudioNode, voice: SynthVoice): void => {
  const filter = createVoiceFilter(context, voice);
  const envelope = createVoiceEnvelope(context, voice);
  const endAt = voice.startAt + voice.attackSeconds + voice.holdSeconds + voice.releaseSeconds + STOP_PADDING_S;
  filter.connect(envelope).connect(output);
  for (const detune of voice.detuneCents) {
    const oscillator = context.createOscillator();
    oscillator.type = voice.wave;
    oscillator.frequency.value = voice.frequency;
    oscillator.detune.value = detune;
    oscillator.connect(filter);
    oscillator.start(voice.startAt);
    oscillator.stop(endAt);
  }
};
