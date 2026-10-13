const SILENT_GAIN = 0.0001;
const STOP_PADDING_S = 0.05;

export interface ToneSpec {
  wave: OscillatorType;
  frequency: number;
  startAt: number;
  peakGain: number;
  attackSeconds: number;
  decaySeconds: number;
  endFrequency?: number;
  sweepSeconds?: number;
}

export const playTone = (context: AudioContext, output: AudioNode, spec: ToneSpec): void => {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const endAt = spec.startAt + spec.decaySeconds;
  oscillator.type = spec.wave;
  oscillator.frequency.setValueAtTime(spec.frequency, spec.startAt);
  if (spec.endFrequency && spec.sweepSeconds) {
    oscillator.frequency.exponentialRampToValueAtTime(spec.endFrequency, spec.startAt + spec.sweepSeconds);
  }
  envelope.gain.setValueAtTime(SILENT_GAIN, spec.startAt);
  envelope.gain.exponentialRampToValueAtTime(Math.max(spec.peakGain, SILENT_GAIN * 2), spec.startAt + spec.attackSeconds);
  envelope.gain.exponentialRampToValueAtTime(SILENT_GAIN, endAt);
  oscillator.connect(envelope).connect(output);
  oscillator.start(spec.startAt);
  oscillator.stop(endAt + STOP_PADDING_S);
};
