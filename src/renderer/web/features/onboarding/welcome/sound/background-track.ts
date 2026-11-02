const TRACK_URL = "/audio/welcome-guitar.mp3";
const TRACK_LEVEL = 0.32;
const TRACK_TONE_HZ = 5200;
const REPEAT_EVERY_S = 15.6;
const REPEAT_FADE_IN_S = 0.8;
const LOOKAHEAD_S = 1;
const TICK_MS = 500;

export interface BackgroundTrack {
  stop: () => void;
}

export const loadBackgroundTrack = async (context: AudioContext): Promise<AudioBuffer> => {
  const response = await fetch(TRACK_URL);
  if (!response.ok) throw new Error(`welcome track failed to load: ${response.status}`);
  return context.decodeAudioData(await response.arrayBuffer());
};

const createTrackBus = (context: AudioContext, output: AudioNode): AudioNode => {
  const tone = context.createBiquadFilter();
  const level = context.createGain();
  tone.type = "lowpass";
  tone.frequency.value = TRACK_TONE_HZ;
  level.gain.value = TRACK_LEVEL;
  tone.connect(level).connect(output);
  return tone;
};

const playPass = (context: AudioContext, bus: AudioNode, buffer: AudioBuffer, startAt: number, fadeIn: boolean): void => {
  const source = context.createBufferSource();
  const entry = context.createGain();
  source.buffer = buffer;
  entry.gain.setValueAtTime(fadeIn ? 0 : 1, startAt);
  entry.gain.linearRampToValueAtTime(1, startAt + REPEAT_FADE_IN_S);
  source.connect(entry).connect(bus);
  source.start(startAt);
};

export const startBackgroundTrack = (context: AudioContext, output: AudioNode, buffer: AudioBuffer): BackgroundTrack => {
  const bus = createTrackBus(context, output);
  let nextAt = context.currentTime;
  playPass(context, bus, buffer, nextAt, false);
  const schedule = (): void => {
    if (nextAt + REPEAT_EVERY_S - context.currentTime > LOOKAHEAD_S) return;
    nextAt += REPEAT_EVERY_S;
    playPass(context, bus, buffer, nextAt, true);
  };
  const timer = window.setInterval(schedule, TICK_MS);
  return { stop: () => window.clearInterval(timer) };
};
