import { AUDIO_CONFIG } from "./encode-audio-stream";

export interface AudioRegion {
  buffer: AudioBuffer;
  startSeconds: number;
  seconds: number;
}

export const renderAudioRegion = async (region: AudioRegion): Promise<AudioBuffer> => {
  const totalSamples = Math.max(1, Math.ceil(region.seconds * AUDIO_CONFIG.sampleRate));
  const offline = new OfflineAudioContext(AUDIO_CONFIG.channels, totalSamples, AUDIO_CONFIG.sampleRate);
  const source = offline.createBufferSource();
  source.buffer = region.buffer;
  source.connect(offline.destination);
  const offset = Math.min(region.startSeconds, Math.max(0, region.buffer.duration));
  source.start(0, offset, region.seconds);
  return offline.startRendering();
};
