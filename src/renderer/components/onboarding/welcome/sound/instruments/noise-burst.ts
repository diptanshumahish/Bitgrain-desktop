export interface NoiseBurst {
  startAt: number;
  seconds: number;
  bandHz: number;
  q: number;
  gain: number;
}

export const playNoiseBurst = (context: AudioContext, output: AudioNode, burst: NoiseBurst): void => {
  const length = Math.max(1, Math.floor(context.sampleRate * burst.seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) samples[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 2;
  const source = context.createBufferSource();
  const band = context.createBiquadFilter();
  const level = context.createGain();
  source.buffer = buffer;
  band.type = "bandpass";
  band.frequency.value = burst.bandHz;
  band.Q.value = burst.q;
  level.gain.value = burst.gain;
  source.connect(band).connect(level).connect(output);
  source.start(burst.startAt);
};
