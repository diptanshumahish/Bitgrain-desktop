import type { AudioRegion } from "@bitgrain/studio-core/animate/audio/render-audio-region";

export interface AudioRegionClock {
  elapsed: () => number;
  stop: () => void;
}

const loopEndFor = (region: AudioRegion): number =>
  Math.min(region.buffer.duration, region.startSeconds + region.seconds);

export const startAudioRegionClock = (region: AudioRegion): AudioRegionClock => {
  const context = new AudioContext();
  if (context.state === "suspended") void context.resume();
  const source = context.createBufferSource();
  source.buffer = region.buffer;
  source.loop = true;
  source.loopStart = region.startSeconds;
  source.loopEnd = loopEndFor(region);
  source.connect(context.destination);
  const loopLength = Math.max(Number.EPSILON, source.loopEnd - source.loopStart);
  const startedAt = context.currentTime;
  source.start(startedAt, region.startSeconds);
  return {
    elapsed: () => {
      const played = Math.max(0, context.currentTime - startedAt - (context.outputLatency || 0));
      return played % loopLength;
    },
    stop: () => {
      source.stop();
      source.disconnect();
      void context.close();
    },
  };
};
