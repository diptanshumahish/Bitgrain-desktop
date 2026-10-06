import type { AudioEq, VideoProject } from "../types";

export interface AudioSource {
  clipId: string;
  blobId: string;
  trackStart: number;
  duration: number;
  inPoint: number;
  speed: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  eq?: AudioEq;
}

function blobIdForAsset(project: VideoProject, assetId: string): string | null {
  const asset = project.mediaPool.find((a) => a.id === assetId);
  return asset?.blobId ?? null;
}

export function collectAudioSources(project: VideoProject): AudioSource[] {
  const sources: AudioSource[] = [];

  for (const track of project.tracks) {
    if (track.muted) continue;

    if (track.kind === "audio") {
      for (const clip of track.clips) {
        if (clip.muted) continue;
        const blobId = blobIdForAsset(project, clip.assetId);
        if (!blobId) continue;
        sources.push({
          clipId: clip.id,
          blobId,
          trackStart: clip.trackStart,
          duration: clip.duration,
          inPoint: clip.inPoint,
          speed: clip.speed ?? 1,
          volume: clip.volume,
          fadeIn: clip.fadeIn,
          fadeOut: clip.fadeOut,
          eq: clip.eq,
        });
      }
    } else if (track.kind === "video") {
      for (const clip of track.clips) {
        if (clip.audioMuted) continue;
        const blobId = blobIdForAsset(project, clip.assetId);
        if (!blobId) continue;
        sources.push({
          clipId: clip.id,
          blobId,
          trackStart: clip.trackStart,
          duration: clip.duration,
          inPoint: clip.inPoint,
          speed: clip.speed ?? 1,
          volume: clip.audioVolume ?? 1,
          fadeIn: clip.fadeIn ?? 0,
          fadeOut: clip.fadeOut ?? 0,
          eq: clip.eq,
        });
      }
    }
  }

  return sources;
}
