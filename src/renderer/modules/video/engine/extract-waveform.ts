const PEAKS_PER_SECOND = 30;

interface WaveformResult {
  peaks: number[];
  duration: number;
  sampleRate: number;
}

let sharedContext: AudioContext | null = null;

function getOfflineFriendlyContext(): AudioContext {
  if (sharedContext) return sharedContext;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  sharedContext = new Ctor();
  return sharedContext;
}

function downsamplePeaks(channel: Float32Array, totalPeaks: number): number[] {
  const blockSize = Math.max(1, Math.floor(channel.length / totalPeaks));
  const peaks: number[] = new Array(totalPeaks);
  for (let i = 0; i < totalPeaks; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channel.length);
    let max = 0;
    for (let j = start; j < end; j++) {
      const v = Math.abs(channel[j]);
      if (v > max) max = v;
    }
    peaks[i] = max;
  }
  return peaks;
}

export async function extractWaveform(blob: Blob): Promise<WaveformResult> {
  const arrayBuffer = await blob.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    throw new Error("Empty audio file");
  }

  const ctx = getOfflineFriendlyContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    if (audioBuffer.numberOfChannels === 0) {
      throw new Error("No audio channels found");
    }

    const channel = audioBuffer.getChannelData(0);
    const totalPeaks = Math.max(
      1,
      Math.floor(audioBuffer.duration * PEAKS_PER_SECOND),
    );
    const peaks = downsamplePeaks(channel, totalPeaks);
    return {
      peaks,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
    };
  } catch (err) {
    console.error("Waveform extraction failed:", err);
    // Fallback for cases where decoding fails but we still want the asset
    return {
      peaks: [],
      duration: 0,
      sampleRate: 44100,
    };
  }
}
