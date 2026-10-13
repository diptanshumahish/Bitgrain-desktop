const TICK_OFFSETS = [0, 0.055, 0.12, 0.2];
const TICK_DURATION = 0.03;
const TICK_VOLUME = 0.09;
const TICK_FREQUENCY = 2600;
const TICK_Q = 4;
const LAND_DELAY = 0.27;
const LAND_DURATION = 0.12;
const LAND_VOLUME = 0.12;
const LAND_START_HZ = 420;
const LAND_END_HZ = 180;
const SILENT_GAIN = 0.0001;

const audioRef = { context: null as AudioContext | null };

const getContext = (): AudioContext => {
  if (!audioRef.context) audioRef.context = new AudioContext();
  return audioRef.context;
};

const fadeOut = (gain: GainNode, start: number, volume: number, duration: number): void => {
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, start + duration);
};

const playTick = (context: AudioContext, start: number): void => {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * TICK_DURATION), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  const filter = new BiquadFilterNode(context, { type: "bandpass", frequency: TICK_FREQUENCY, Q: TICK_Q });
  const gain = context.createGain();
  fadeOut(gain, start, TICK_VOLUME, TICK_DURATION);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
};

const playLanding = (context: AudioContext, start: number): void => {
  const oscillator = new OscillatorNode(context, { type: "sine", frequency: LAND_START_HZ });
  const gain = context.createGain();
  oscillator.frequency.exponentialRampToValueAtTime(LAND_END_HZ, start + LAND_DURATION);
  fadeOut(gain, start, LAND_VOLUME, LAND_DURATION);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + LAND_DURATION);
};

export const playRollSound = async (): Promise<void> => {
  const context = getContext();
  if (context.state === "suspended") await context.resume();
  const now = context.currentTime;
  TICK_OFFSETS.forEach((offset) => playTick(context, now + offset));
  playLanding(context, now + LAND_DELAY);
};
