import { updateProject, selectedClipIdSignal } from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import { TRACK_HEIGHT } from "../constants";
import type { Track, TrackingClip, TrackingTrack } from "../types";
import { newId } from "./id";

const DEFAULT_TRACKING_DURATION = 5;
const SEED_RANGE = 100000;

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

export function addTrackingAtPlayhead(): void {
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    let track = tracks.find((t): t is TrackingTrack => t.kind === "tracking") ?? null;
    if (!track) {
      track = {
        id: newId(),
        kind: "tracking",
        name: "Tracking",
        locked: false,
        muted: false,
        visible: true,
        height: TRACK_HEIGHT,
        clips: [],
      };
      tracks.push(track);
    }

    const clip: TrackingClip = {
      id: newId(),
      kind: "tracking",
      trackStart: currentTimeSignal.value,
      duration: DEFAULT_TRACKING_DURATION,
      seed: Math.floor(Math.random() * SEED_RANGE) + 1,
      nodeCount: 7,
      lineColor: "#E5E5E5",
      labelColor: "#D4D4D4",
      showCoordinates: true,
      showThumbnails: true,
      showArrows: true,
      labelBackground: false,
      thumbZoom: 2.5,
      speed: 1,
      strokeWidth: 1.5,
      labelScale: 1,
      markerScale: 1,
      fadeIn: 0.3,
      fadeOut: 0.3,
    };
    track.clips.push(clip);
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
