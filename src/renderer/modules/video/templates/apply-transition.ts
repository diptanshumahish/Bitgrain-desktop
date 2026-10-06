import { updateProject, selectedClipIdSignal } from "../store/project-store";
import { clampFade } from "../utils/clip-fade";
import type { BaseClip, Track } from "../types";
import type { TransitionKind } from "./types";

interface ClipNeighbour {
  prevClipId: string | null;
  selectedClipId: string;
  trackId: string;
  trackKind: Track["kind"];
}

function clipEnd(clip: BaseClip): number {
  return clip.trackStart + clip.duration;
}

function findNeighbour(
  tracks: Track[],
  clipId: string,
): ClipNeighbour | null {
  for (const track of tracks) {
    if (track.kind === "effect") continue;
    const idx = track.clips.findIndex((c) => c.id === clipId);
    if (idx < 0) continue;
    const target = track.clips[idx];
    let prevClipId: string | null = null;
    let prevEndDiff = Infinity;
    for (const candidate of track.clips) {
      if (candidate.id === clipId) continue;
      const end = clipEnd(candidate);
      if (end > target.trackStart + 0.0001) continue;
      const diff = target.trackStart - end;
      if (diff < prevEndDiff) {
        prevEndDiff = diff;
        prevClipId = candidate.id;
      }
    }
    return { prevClipId, selectedClipId: clipId, trackId: track.id, trackKind: track.kind };
  }
  return null;
}

function patchFadeClips<C extends { id: string; duration: number; fadeIn?: number; fadeOut?: number }>(
  clips: C[],
  clipId: string,
  patch: { fadeIn?: number; fadeOut?: number },
): C[] {
  return clips.map((c) => {
    if (c.id !== clipId) return c;
    const fadeIn = patch.fadeIn !== undefined ? clampFade(patch.fadeIn, c.duration) : undefined;
    const fadeOut = patch.fadeOut !== undefined ? clampFade(patch.fadeOut, c.duration) : undefined;
    return {
      ...c,
      ...(fadeIn !== undefined ? { fadeIn } : {}),
      ...(fadeOut !== undefined ? { fadeOut } : {}),
    };
  });
}

function setFadeOnClipInTrack(
  track: Track,
  clipId: string,
  patch: { fadeIn?: number; fadeOut?: number },
): Track {
  switch (track.kind) {
    case "video":
      return { ...track, clips: patchFadeClips(track.clips, clipId, patch) };
    case "audio":
      return { ...track, clips: patchFadeClips(track.clips, clipId, patch) };
    case "text":
      return { ...track, clips: patchFadeClips(track.clips, clipId, patch) };
    case "image":
      return { ...track, clips: patchFadeClips(track.clips, clipId, patch) };
    case "tracking":
      return { ...track, clips: patchFadeClips(track.clips, clipId, patch) };
    case "effect":
      return track;
  }
}

const DIP_COLORS: Record<TransitionKind, string | undefined> = {
  crossfade: undefined,
  "dip-black": "#000000",
  "dip-white": "#ffffff",
  soft: undefined,
};

function setDipColorInTrack(track: Track, clipIds: string[], dipColor: string | undefined): Track {
  if (track.kind !== "video") return track;
  return {
    ...track,
    clips: track.clips.map((clip) => (clipIds.includes(clip.id) ? { ...clip, dipColor } : clip)),
  };
}

function durationForKind(kind: TransitionKind, base: number): { fadeIn: number; fadeOut: number } {
  switch (kind) {
    case "crossfade":
      return { fadeIn: base, fadeOut: base };
    case "dip-black":
      return { fadeIn: base, fadeOut: base };
    case "dip-white":
      return { fadeIn: base * 0.4, fadeOut: base * 0.4 };
    case "soft":
      return { fadeIn: base, fadeOut: base };
  }
}

export function applyTransitionToSelected(kind: TransitionKind, baseDuration: number): boolean {
  const selectedId = selectedClipIdSignal.value;
  if (!selectedId) return false;
  let applied = false;
  updateProject((project) => {
    const neighbour = findNeighbour(project.tracks, selectedId);
    if (!neighbour) return project;
    const { fadeIn, fadeOut } = durationForKind(kind, baseDuration);

    const tracks = project.tracks.map((track) => {
      if (track.id !== neighbour.trackId) return track;
      let next = setFadeOnClipInTrack(track, neighbour.selectedClipId, { fadeIn });
      if (neighbour.prevClipId) {
        next = setFadeOnClipInTrack(next, neighbour.prevClipId, { fadeOut });
      }
      const touched = [neighbour.selectedClipId, ...(neighbour.prevClipId ? [neighbour.prevClipId] : [])];
      return setDipColorInTrack(next, touched, DIP_COLORS[kind]);
    });
    applied = true;
    return { ...project, tracks };
  });
  return applied;
}
