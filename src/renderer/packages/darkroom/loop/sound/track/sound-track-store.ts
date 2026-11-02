import { signal } from "@bitgrain/core/signal";
import { mixToMono } from "@bitgrain/engine/audio/analysis/mono-mix";
import { downsamplePeaks } from "@bitgrain/engine/audio/waveform-peaks";
import { soundSettingsSignal, updateSoundSettings } from "../sound-settings";
import { decodeAudioFile } from "@bitgrain/studio-core/animate/audio/decode-audio-file";
import { loudestWindowStart } from "@bitgrain/engine/loop/sound-window";

export interface SoundTrack {
  name: string;
  buffer: AudioBuffer;
  mono: Float32Array;
  peaks: number[];
}

const MEGABYTE = 1024 * 1024;
const MAX_FILE_MEGABYTES = 80;
const PEAK_COUNT = 480;
const TOO_LARGE_MESSAGE = `That file is over ${MAX_FILE_MEGABYTES} MB. Try a shorter clip or an mp3.`;
const UNREADABLE_MESSAGE = "We could not read that file. Try an mp3, wav or m4a.";

export const soundTrackSignal = signal<SoundTrack | null>(null);
export const soundTrackLoadingSignal = signal(false);
export const soundTrackErrorSignal = signal<string | null>(null);

const readTrack = async (file: File): Promise<SoundTrack> => {
  const buffer = await decodeAudioFile(file);
  const mono = mixToMono(buffer);
  return { name: file.name, buffer, mono, peaks: downsamplePeaks(mono, PEAK_COUNT) };
};

const startAtLoudestPart = (track: SoundTrack): void => {
  const { seconds } = soundSettingsSignal.value;
  updateSoundSettings({ startSeconds: loudestWindowStart(track.peaks, track.buffer.duration, seconds) });
};

export const loadSoundTrack = async (file: File): Promise<void> => {
  soundTrackErrorSignal.value = null;
  if (file.size > MAX_FILE_MEGABYTES * MEGABYTE) {
    soundTrackErrorSignal.value = TOO_LARGE_MESSAGE;
    return;
  }
  soundTrackLoadingSignal.value = true;
  try {
    const track = await readTrack(file);
    soundTrackSignal.value = track;
    startAtLoudestPart(track);
  } catch (error) {
    soundTrackErrorSignal.value = error instanceof RangeError ? TOO_LARGE_MESSAGE : UNREADABLE_MESSAGE;
  } finally {
    soundTrackLoadingSignal.value = false;
  }
};

export const clearSoundTrack = (): void => {
  soundTrackSignal.value = null;
  soundTrackErrorSignal.value = null;
};
