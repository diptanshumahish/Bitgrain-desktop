import {
  currentProjectSignal,
  updateProject,
  setClipSelection,
} from "../store/project-store";
import { TRACK_HEIGHT } from "../constants";
import { newId } from "./id";
import type { AudioClip, AudioTrack, Track, VideoClip, VideoProject } from "../types";

function findVideoClip(project: VideoProject, clipId: string): VideoClip | null {
  for (const track of project.tracks) {
    if (track.kind !== "video") continue;
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return clip;
  }
  return null;
}

export function detachClipAudio(videoClipId: string): void {
  const current = currentProjectSignal.value;
  if (!current) return;
  const existing = findVideoClip(current, videoClipId);
  if (!existing || existing.linkedClipId) return;

  const audioId = newId();
  updateProject((project) => {
    const video = findVideoClip(project, videoClipId);
    if (!video) return project;

    const audioClip: AudioClip = {
      id: audioId,
      assetId: video.assetId,
      trackStart: video.trackStart,
      duration: video.duration,
      inPoint: video.inPoint,
      speed: video.speed,
      volume: video.audioVolume ?? 1,
      eq: video.eq,
      fadeIn: video.fadeIn ?? 0,
      fadeOut: video.fadeOut ?? 0,
      linkedClipId: video.id,
    };

    const tracks = project.tracks.map((t) => ({ ...t, clips: [...t.clips] })) as Track[];
    const videoTrackIdx = tracks.findIndex(
      (t) => t.kind === "video" && t.clips.some((c) => c.id === videoClipId),
    );
    if (videoTrackIdx < 0) return project;

    const audioTrack: AudioTrack = {
      id: newId(),
      kind: "audio",
      name: `AUDIO ${tracks.filter((t) => t.kind === "audio").length + 1}`,
      locked: false,
      muted: false,
      visible: true,
      height: TRACK_HEIGHT,
      clips: [audioClip],
    };
    tracks.splice(videoTrackIdx + 1, 0, audioTrack);

    const patched = tracks.map((t) => {
      if (t.kind !== "video") return t;
      const idx = t.clips.findIndex((c) => c.id === videoClipId);
      if (idx < 0) return t;
      const clips = [...t.clips];
      clips[idx] = {
        ...clips[idx],
        audioMuted: true,
        audioDetached: true,
        linkedClipId: audioId,
      };
      return { ...t, clips };
    });

    return { ...project, tracks: patched };
  });
  setClipSelection([audioId]);
}

export function unlinkClip(clipId: string): void {
  updateProject((project) => {
    let partnerId: string | null = null;
    for (const track of project.tracks) {
      const clip = track.clips.find((c) => c.id === clipId) as
        | { linkedClipId?: string }
        | undefined;
      if (clip?.linkedClipId) {
        partnerId = clip.linkedClipId;
        break;
      }
    }
    const clearIds = new Set([clipId]);
    if (partnerId) clearIds.add(partnerId);
    const tracks = project.tracks.map((track) => {
      if (!track.clips.some((c) => clearIds.has(c.id))) return track;
      return {
        ...track,
        clips: track.clips.map((c) =>
          clearIds.has(c.id) ? { ...c, linkedClipId: undefined } : c,
        ),
      };
    }) as Track[];
    return { ...project, tracks };
  });
}
