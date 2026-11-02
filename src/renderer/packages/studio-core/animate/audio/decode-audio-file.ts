import { AUDIO_CONFIG } from "./encode-audio-stream";

const DECODE_LENGTH = 1;

export const decodeAudioFile = async (file: Blob): Promise<AudioBuffer> => {
  const bytes = await file.arrayBuffer();
  const context = new OfflineAudioContext(AUDIO_CONFIG.channels, DECODE_LENGTH, AUDIO_CONFIG.sampleRate);
  return context.decodeAudioData(bytes);
};
