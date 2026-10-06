const AUDIO_CHANNELS = 2;
const AUDIO_SAMPLE_RATE = 48000;
const AUDIO_CHUNK_FRAMES = 1024;

export const AUDIO_BITRATE = 128_000;
export const AUDIO_CODEC = "mp4a.40.2";

export interface AudioEncodeConfig {
  sampleRate: number;
  channels: number;
}

export const AUDIO_CONFIG: AudioEncodeConfig = {
  sampleRate: AUDIO_SAMPLE_RATE,
  channels: AUDIO_CHANNELS,
};

function planarFromAudioBuffer(
  buffer: AudioBuffer,
  startFrame: number,
  frameCount: number,
): Float32Array {
  const channels = Math.min(AUDIO_CHANNELS, buffer.numberOfChannels);
  const out = new Float32Array(frameCount * AUDIO_CHANNELS);
  for (let ch = 0; ch < AUDIO_CHANNELS; ch++) {
    const sourceCh = ch < channels ? ch : 0;
    const data = buffer.getChannelData(sourceCh);
    const offset = ch * frameCount;
    const end = Math.min(startFrame + frameCount, data.length);
    for (let i = startFrame, j = 0; i < end; i++, j++) {
      out[offset + j] = data[i];
    }
  }
  return out;
}

interface FlushableEncoder {
  encodeQueueSize: number;
  flush(): Promise<void>;
}

async function awaitQueue(encoder: FlushableEncoder, max = 4): Promise<void> {
  while (encoder.encodeQueueSize > max) {
    await new Promise<void>((r) => setTimeout(r, 8));
  }
}

interface EncodeAudioOpts {
  audioEncoder: AudioEncoder;
  audioBuffer: AudioBuffer;
  isCancelled: () => boolean;
  getMuxerError: () => string | null;
}

export async function encodeAudioStream(opts: EncodeAudioOpts): Promise<void> {
  const { audioEncoder, audioBuffer, isCancelled, getMuxerError } = opts;
  const totalAudioFrames = audioBuffer.length;
  let frameCursor = 0;
  while (frameCursor < totalAudioFrames) {
    if (isCancelled()) throw new Error("cancelled");
    const chunkFrames = Math.min(AUDIO_CHUNK_FRAMES, totalAudioFrames - frameCursor);
    const planar = planarFromAudioBuffer(audioBuffer, frameCursor, chunkFrames);
    const timestampMicros = Math.round((frameCursor * 1_000_000) / AUDIO_SAMPLE_RATE);
    const audioData = new AudioData({
      format: "f32-planar",
      sampleRate: AUDIO_SAMPLE_RATE,
      numberOfChannels: AUDIO_CHANNELS,
      numberOfFrames: chunkFrames,
      timestamp: timestampMicros,
      data: planar.buffer as ArrayBuffer,
    });
    if (audioEncoder.state === "closed") {
      audioData.close();
      throw new Error(getMuxerError() || "AudioEncoder closed unexpectedly");
    }
    audioEncoder.encode(audioData);
    audioData.close();
    frameCursor += chunkFrames;
    if ((frameCursor / AUDIO_CHUNK_FRAMES) % 16 === 0) {
      await awaitQueue(audioEncoder);
    }
  }
}
