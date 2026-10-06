import { updateProject, selectedClipIdSignal } from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import type { TextClip, TextTrack, Track } from "../types";
import { newId } from "../utils/id";
import type { OverlayTextPart, TextTemplate } from "./types";

function cloneTrack(track: Track): Track {
  switch (track.kind) {
    case "video":
      return { ...track, clips: [...track.clips] };
    case "audio":
      return { ...track, clips: [...track.clips] };
    case "text":
      return { ...track, clips: [...track.clips] };
    case "effect":
      return { ...track, clips: [...track.clips] };
    case "image":
      return { ...track, clips: [...track.clips] };
    case "tracking":
      return { ...track, clips: [...track.clips] };
  }
}

function recomputeDuration(tracks: Track[]): number {
  let max = 0;
  for (const track of tracks) {
    for (const clip of track.clips) {
      const end = clip.trackStart + clip.duration;
      if (end > max) max = end;
    }
  }
  return max;
}

function ensureTextTrack(tracks: Track[]): TextTrack {
  const found = tracks.find((t): t is TextTrack => t.kind === "text");
  if (found) return found;
  const created: TextTrack = {
    id: newId(),
    kind: "text",
    name: "Aa",
    locked: false,
    muted: false,
    visible: true,
    height: 56,
    clips: [],
  };
  tracks.push(created);
  return created;
}

function buildTextClip(
  trackStart: number,
  part: TextTemplate | (OverlayTextPart & { duration: number }),
): TextClip {
  return {
    id: newId(),
    trackStart,
    duration: part.duration,
    text: part.text,
    font: part.font,
    size: part.size,
    color: part.color,
    weight: part.weight,
    position: part.position,
    align: part.align,
    animation: part.animation,
    fadeIn: part.fadeIn,
    fadeOut: part.fadeOut,
  };
}

export function applyTextTemplate(template: TextTemplate): void {
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    const textTrack = ensureTextTrack(tracks);
    const clip = buildTextClip(currentTimeSignal.value, template);
    textTrack.clips = [...textTrack.clips, clip];
    selectedClipIdSignal.value = clip.id;
    return { ...project, tracks, duration: recomputeDuration(tracks) };
  });
}

export function applyOverlayParts(parts: OverlayTextPart[], baseTime?: number): void {
  if (parts.length === 0) return;
  const at = baseTime ?? currentTimeSignal.value;
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    const textTrack = ensureTextTrack(tracks);
    let lastId: string | null = null;
    for (const part of parts) {
      const clip = buildTextClip(at + part.offset, { ...part, duration: part.duration });
      textTrack.clips = [...textTrack.clips, clip];
      lastId = clip.id;
    }
    if (lastId) selectedClipIdSignal.value = lastId;
    return { ...project, tracks, duration: recomputeDuration(tracks) };
  });
}
