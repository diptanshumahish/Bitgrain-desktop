import { updateProject } from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import { TRACK_HEIGHT } from "../constants";
import type {
  AudioClip,
  AudioTrack,
  ImageClip,
  ImageTrack,
  MediaAsset,
  Track,
  VideoClip,
  VideoTrack,
} from "../types";
import { newId } from "./id";

const DEFAULT_VIDEO_CLIP_DURATION = 5;

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

export function addAssetToTimeline(asset: MediaAsset): void {
  updateProject((project) => {
    const tracks: Track[] = project.tracks.map(cloneTrack);
    const at = currentTimeSignal.value;

    if (asset.kind === "image") {
      let target = tracks.find((t): t is ImageTrack => t.kind === "image") ?? null;
      if (!target) {
        target = {
          id: newId(),
          kind: "image",
          name: `IMG ${tracks.filter((t) => t.kind === "image").length + 1}`,
          locked: false,
          muted: false,
          visible: true,
          height: TRACK_HEIGHT,
          clips: [],
        };
        tracks.push(target);
      }
      const clip: ImageClip = {
        id: newId(),
        assetId: asset.id,
        trackStart: at,
        duration: Math.max(asset.duration || DEFAULT_VIDEO_CLIP_DURATION, 1 / project.fps),
        position: { x: 0.5, y: 0.5 },
        scale: 1,
        rotation: 0,
        opacity: 1,
        filters: {},
        fadeIn: 0,
        fadeOut: 0,
      };
      target.clips.push(clip);
    } else if (asset.kind === "video") {
      const target = tracks.find((t): t is VideoTrack => t.kind === "video") ?? null;
      if (!target) return project;
      const clip: VideoClip = {
        id: newId(),
        assetId: asset.id,
        trackStart: at,
        inPoint: 0,
        duration: Math.max(asset.duration, 1 / project.fps),
        effects: [],
        transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        opacity: 1,
        audioDetached: false,
      };
      target.clips.push(clip);
    } else {
      const target = tracks.find((t): t is AudioTrack => t.kind === "audio") ?? null;
      if (!target) return project;
      const clip: AudioClip = {
        id: newId(),
        assetId: asset.id,
        trackStart: at,
        inPoint: 0,
        duration: Math.max(asset.duration, 0.1),
        volume: 1,
        fadeIn: 0,
        fadeOut: 0,
      };
      target.clips.push(clip);
    }

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
