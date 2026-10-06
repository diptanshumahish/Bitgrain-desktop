import {
  currentProjectSignal,
} from "../store/project-store";
import {
  isPlayingSignal,
} from "../store/playback-store";
import {
  currentTimeSignal,
} from "../store/timeline-store";
import { getMediaBlob } from "../utils/media-blob-store";
import { collectAudioSources } from "./audio-sources";
import { buildEqChain } from "./audio-eq";
import { scheduleFadeEnvelope } from "./processing/audio-fade";

interface ScheduledSource {
  source: AudioBufferSourceNode;
  gain: GainNode;
  clipId: string;
}

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let exportDestination: MediaStreamAudioDestinationNode | null = null;
const bufferCache = new Map<string, AudioBuffer>();
const failedBuffers = new Set<string>();
let scheduled: ScheduledSource[] = [];
let unsubscribePlay: (() => void) | null = null;
let unsubscribeTime: (() => void) | null = null;
let lastPlayingState = false;

function ensureContext(): AudioContext {
  if (audioContext) return audioContext;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  audioContext = new Ctor();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(audioContext.destination);
  return audioContext;
}

async function getBuffer(blobId: string): Promise<AudioBuffer | null> {
  if (!blobId || failedBuffers.has(blobId)) return null;
  const cached = bufferCache.get(blobId);
  if (cached) return cached;
  const blob = await getMediaBlob(blobId);
  if (!blob) return null;
  const arr = await blob.arrayBuffer();
  const ctx = ensureContext();
  try {
    const buffer = await ctx.decodeAudioData(arr.slice(0));
    bufferCache.set(blobId, buffer);
    return buffer;
  } catch {
    failedBuffers.add(blobId);
    return null;
  }
}

function stopAllScheduled(): void {
  for (const s of scheduled) {
    try {
      s.source.stop();
    } catch {
      // already stopped
    }
    s.source.disconnect();
    s.gain.disconnect();
  }
  scheduled = [];
}

async function startPlaybackAt(time: number): Promise<void> {
  const project = currentProjectSignal.value;
  if (!project) return;
  const ctx = ensureContext();
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      // user gesture required, will retry next play
    }
  }

  const sources = collectAudioSources(project).filter(
    (s) => s.trackStart + s.duration > time,
  );
  const startWall = ctx.currentTime + 0.05;

  for (const src of sources) {
    const buffer = await getBuffer(src.blobId);
    if (!buffer) continue;
    if (!isPlayingSignal.value) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const clipPlayheadOffset = Math.max(0, time - src.trackStart);
    scheduleFadeEnvelope(gain.gain, src, startWall + src.trackStart - time, clipPlayheadOffset);

    const eq = buildEqChain(ctx, src.eq);
    if (eq) {
      source.connect(eq.input);
      eq.output.connect(gain);
    } else {
      source.connect(gain);
    }
    if (masterGain) gain.connect(masterGain);

    const speed = src.speed;
    source.playbackRate.value = speed;
    const sourceOffset = src.inPoint + clipPlayheadOffset * speed;
    const remainingBuffer = (src.duration - clipPlayheadOffset) * speed;
    const startOffset = Math.max(0, src.trackStart - time);

    if (sourceOffset >= buffer.duration) continue;
    if (remainingBuffer <= 0) continue;

    try {
      source.start(
        startWall + startOffset,
        Math.min(sourceOffset, buffer.duration - 0.01),
        Math.min(remainingBuffer, buffer.duration - sourceOffset),
      );
    } catch {
      continue;
    }
    scheduled.push({ source, gain, clipId: src.clipId });
  }
}

function handlePlayingChange(): void {
  const playing = isPlayingSignal.value;
  if (playing === lastPlayingState) return;
  lastPlayingState = playing;
  stopAllScheduled();
  if (playing) {
    startPlaybackAt(currentTimeSignal.value);
  }
}

let lastSeekTime = 0;
function handleTimeChange(): void {
  if (!isPlayingSignal.value) return;
  const now = currentTimeSignal.value;
  if (Math.abs(now - lastSeekTime) > 0.5) {
    lastSeekTime = now;
    stopAllScheduled();
    startPlaybackAt(now);
  } else {
    lastSeekTime = now;
  }
}

export function startAudioEngine(): () => void {
  unsubscribePlay = isPlayingSignal.subscribe(handlePlayingChange);
  unsubscribeTime = currentTimeSignal.subscribe(handleTimeChange);
  lastPlayingState = isPlayingSignal.value;
  lastSeekTime = currentTimeSignal.value;
  if (lastPlayingState) startPlaybackAt(currentTimeSignal.value);

  return () => {
    if (unsubscribePlay) unsubscribePlay();
    if (unsubscribeTime) unsubscribeTime();
    stopAllScheduled();
    lastPlayingState = false;
  };
}

export function attachExportRecorder(): MediaStream | null {
  const ctx = ensureContext();
  if (!masterGain) return null;
  if (!exportDestination) {
    exportDestination = ctx.createMediaStreamDestination();
    masterGain.connect(exportDestination);
  }
  return exportDestination.stream;
}

export function detachExportRecorder(): void {
  if (!exportDestination || !masterGain) return;
  try {
    masterGain.disconnect(exportDestination);
  } catch {
    // already disconnected
  }
  exportDestination = null;
}

