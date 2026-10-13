const REVERB_SECONDS = 4.5;
const REVERB_DECAY_POWER = 2.6;
const WET_LEVEL = 0.55;
const CHANNELS = 2;

const buildImpulse = (context: AudioContext): AudioBuffer => {
  const length = Math.floor(context.sampleRate * REVERB_SECONDS);
  const impulse = context.createBuffer(CHANNELS, length, context.sampleRate);
  for (let channel = 0; channel < CHANNELS; channel += 1) {
    const samples = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, REVERB_DECAY_POWER);
    }
  }
  return impulse;
};

export const createSpaceReverb = (context: AudioContext, destination: AudioNode): AudioNode => {
  const input = context.createGain();
  const convolver = context.createConvolver();
  const wet = context.createGain();
  convolver.buffer = buildImpulse(context);
  wet.gain.value = WET_LEVEL;
  input.connect(destination);
  input.connect(convolver).connect(wet).connect(destination);
  return input;
};
