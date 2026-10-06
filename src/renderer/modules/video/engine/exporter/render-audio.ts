import { getMediaBlob } from "../../utils/media-blob-store";
import type { VideoProject } from "../../types";
import { collectAudioSources } from "../audio-sources";
import { buildEqChain } from "../audio-eq";
import { scheduleFadeEnvelope } from "../processing/audio-fade";
import { rangeDuration, type ExportRange } from "./support/export-range";

const SAMPLE_RATE = 48000;
const CHANNELS = 2;
const MIN_TAIL_SECONDS = 0.001;

export async function renderProjectAudio(
  project: VideoProject,
  range: ExportRange,
): Promise<AudioBuffer | null> {
  const sources = collectAudioSources(project).filter(
    (src) => src.trackStart < range.end && src.trackStart + src.duration > range.start,
  );
  if (sources.length === 0) return null;

  const totalSamples = Math.max(1, Math.ceil(rangeDuration(range) * SAMPLE_RATE));
  const offline = new OfflineAudioContext(CHANNELS, totalSamples, SAMPLE_RATE);

  for (const src of sources) {
    const blob = await getMediaBlob(src.blobId);
    if (!blob) continue;
    const arr = await blob.arrayBuffer();
    let buffer: AudioBuffer;
    try {
      buffer = await offline.decodeAudioData(arr.slice(0));
    } catch {
      continue;
    }

    const source = offline.createBufferSource();
    source.buffer = buffer;
    const gain = offline.createGain();
    const clipZeroAt = src.trackStart - range.start;
    const skipped = Math.max(0, -clipZeroAt);
    scheduleFadeEnvelope(gain.gain, src, clipZeroAt, skipped);

    const eq = buildEqChain(offline, src.eq);
    if (eq) {
      source.connect(eq.input);
      eq.output.connect(gain);
    } else {
      source.connect(gain);
    }
    gain.connect(offline.destination);

    source.playbackRate.value = src.speed;
    const offset = Math.min(src.inPoint + skipped * src.speed, Math.max(0, buffer.duration - MIN_TAIL_SECONDS));
    const dur = Math.min((src.duration - skipped) * src.speed, Math.max(0, buffer.duration - offset));
    if (dur <= 0) continue;
    source.start(Math.max(0, clipZeroAt), offset, dur);
  }

  return offline.startRendering();
}
