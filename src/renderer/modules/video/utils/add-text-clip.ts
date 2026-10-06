import { updateProject, selectedClipIdSignal } from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import type { TextClip, TextTrack, Track } from "../types";
import { newId } from "./id";

const DEFAULT_TEXT_DURATION = 3;

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

export function addTextAtPlayhead(): void {
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    const text = tracks.find((t): t is TextTrack => t.kind === "text");
    if (!text) return project;

    const clip: TextClip = {
      id: newId(),
      trackStart: currentTimeSignal.value,
      duration: DEFAULT_TEXT_DURATION,
      text: "Your text",
      font: "'Akasha', sans-serif",
      size: 80,
      color: "#FFFFFF",
      weight: 600,
      position: { x: 0.5, y: 0.85 },
      align: "center",
      animation: "none",
    };
    text.clips.push(clip);
    selectedClipIdSignal.value = clip.id;

    const newDuration = tracks.reduce((max, t) => {
      for (const c of t.clips) {
        const end = c.trackStart + c.duration;
        if (end > max) max = end;
      }
      return max;
    }, 0);

    return { ...project, tracks, duration: newDuration };
  });
}
