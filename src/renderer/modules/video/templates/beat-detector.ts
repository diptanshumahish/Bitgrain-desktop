const FRAME_SIZE = 1024;
const HOP_SIZE = 512;
const MIN_BEAT_GAP_SECONDS = 0.18;
const PEAK_WINDOW = 6;
const PEAK_THRESHOLD = 1.4;

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (sharedContext) return sharedContext;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  sharedContext = new Ctor();
  return sharedContext;
}

function computeEnergyFlux(channel: Float32Array): Float32Array {
  const frameCount = Math.max(0, Math.floor((channel.length - FRAME_SIZE) / HOP_SIZE));
  const flux = new Float32Array(frameCount);
  let prevEnergy = 0;
  for (let i = 0; i < frameCount; i++) {
    const start = i * HOP_SIZE;
    let energy = 0;
    for (let j = 0; j < FRAME_SIZE; j++) {
      const sample = channel[start + j];
      energy += sample * sample;
    }
    energy = Math.sqrt(energy / FRAME_SIZE);
    flux[i] = Math.max(0, energy - prevEnergy);
    prevEnergy = energy;
  }
  return flux;
}

function pickPeaks(flux: Float32Array, sampleRate: number): number[] {
  const beats: number[] = [];
  const framesPerSecond = sampleRate / HOP_SIZE;
  const minGapFrames = Math.max(1, Math.floor(framesPerSecond * MIN_BEAT_GAP_SECONDS));
  let lastBeatFrame = -minGapFrames;

  let mean = 0;
  for (let i = 0; i < flux.length; i++) mean += flux[i];
  mean = flux.length > 0 ? mean / flux.length : 0;

  for (let i = PEAK_WINDOW; i < flux.length - PEAK_WINDOW; i++) {
    const value = flux[i];
    if (value < mean * PEAK_THRESHOLD) continue;
    let localMax = true;
    for (let k = -PEAK_WINDOW; k <= PEAK_WINDOW; k++) {
      if (k === 0) continue;
      if (flux[i + k] > value) {
        localMax = false;
        break;
      }
    }
    if (!localMax) continue;
    if (i - lastBeatFrame < minGapFrames) continue;
    lastBeatFrame = i;
    beats.push(i / framesPerSecond);
  }
  return beats;
}

export async function detectBeatsInBlob(blob: Blob): Promise<{ beats: number[]; duration: number }> {
  const buffer = await blob.arrayBuffer();
  if (buffer.byteLength === 0) return { beats: [], duration: 0 };
  const ctx = getContext();
  if (ctx.state === "suspended") await ctx.resume();
  try {
    const decoded = await ctx.decodeAudioData(buffer.slice(0));
    if (decoded.numberOfChannels === 0) return { beats: [], duration: 0 };
    const channel = decoded.getChannelData(0);
    const flux = computeEnergyFlux(channel);
    const beats = pickPeaks(flux, decoded.sampleRate);
    return { beats, duration: decoded.duration };
  } catch (err) {
    console.error("Beat detection failed:", err);
    return { beats: [], duration: 0 };
  }
}
