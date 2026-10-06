import { updateProject } from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import { TRACK_HEIGHT } from "../constants";
import type { TextClip, TextTrack, Track } from "../types";
import { newId } from "../utils/id";
import type { ProjectTemplate } from "./types";

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
    height: TRACK_HEIGHT,
    clips: [],
  };
  tracks.push(created);
  return created;
}

function buildTitleClip(
  part: ProjectTemplate["titles"][number],
  base: number,
): TextClip {
  return {
    id: newId(),
    trackStart: base + part.offset,
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

export function applyProjectTemplate(template: ProjectTemplate): void {
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    const base = currentTimeSignal.value;

    if (template.titles.length > 0) {
      const track = ensureTextTrack(tracks);
      const next = [...track.clips];
      for (const title of template.titles) {
        next.push(buildTitleClip(title, base));
      }
      track.clips = next;
    }

    return { ...project, tracks, duration: recomputeDuration(tracks) };
  });
}
