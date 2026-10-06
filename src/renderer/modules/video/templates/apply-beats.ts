import { updateProject, currentProjectSignal } from "../store/project-store";
import { TRACK_HEIGHT, MIN_CLIP_DURATION } from "../constants";
import { splitClipAtTime } from "../utils/edit-ops";
import { newId } from "../utils/id";
import type {
  AudioClip,
  AudioTrack,
  EffectClip,
  FxTrack,
  TextClip,
  TextTrack,
  Track,
  VideoClip,
  VideoTrack,
} from "../types";
import { detectBeatsInBlob } from "./beat-detector";
import { getMediaBlob } from "../utils/media-blob-store";

const DEFAULT_FONT = "'Akasha', sans-serif";

function findAudioClipOnTimeline(): { clip: AudioClip; track: AudioTrack } | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  for (const track of project.tracks) {
    if (track.kind !== "audio") continue;
    if (track.clips.length === 0) continue;
    const sorted = [...track.clips].sort((a, b) => a.duration - b.duration).reverse();
    const longest = sorted[0];
    if (longest) return { clip: longest, track };
  }
  return null;
}

interface BeatAnalysis {
  beats: number[];
  clip: AudioClip;
}

export async function analyzeBeatsForTimelineAudio(): Promise<BeatAnalysis | null> {
  const found = findAudioClipOnTimeline();
  if (!found) return null;
  const project = currentProjectSignal.value;
  if (!project) return null;
  const asset = project.mediaPool.find((a) => a.id === found.clip.assetId);
  if (!asset) return null;
  const blob = await getMediaBlob(asset.blobId);
  if (!blob) return null;
  const { beats } = await detectBeatsInBlob(blob);
  const absoluteBeats = beats
    .filter((t) => t >= found.clip.inPoint && t < found.clip.inPoint + found.clip.duration)
    .map((t) => found.clip.trackStart + (t - found.clip.inPoint));
  return { beats: absoluteBeats, clip: found.clip };
}

function findActiveVideoClipAt(time: number): { clip: VideoClip; track: VideoTrack } | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  for (const track of project.tracks) {
    if (track.kind !== "video") continue;
    for (const clip of track.clips) {
      if (time >= clip.trackStart && time < clip.trackStart + clip.duration) {
        return { clip, track };
      }
    }
  }
  return null;
}

export function sliceVideoAtBeats(beats: number[]): number {
  let slices = 0;
  for (const beatTime of beats) {
    const found = findActiveVideoClipAt(beatTime);
    if (!found) continue;
    const localTime = beatTime - found.clip.trackStart;
    if (localTime <= MIN_CLIP_DURATION) continue;
    if (localTime >= found.clip.duration - MIN_CLIP_DURATION) continue;
    splitClipAtTime(found.clip.id, beatTime);
    slices += 1;
  }
  return slices;
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

function buildBeatTextClip(time: number, label: string): TextClip {
  return {
    id: newId(),
    trackStart: time,
    duration: 0.6,
    text: label,
    font: DEFAULT_FONT,
    size: 220,
    color: "#FFFFFF",
    weight: 900,
    position: { x: 0.5, y: 0.5 },
    align: "center",
    animation: "pop",
    fadeOut: 0.2,
  };
}

export function pulseTextAtBeats(beats: number[], label = "•"): number {
  if (beats.length === 0) return 0;
  let added = 0;
  updateProject((project) => {
    const tracks = project.tracks.map((t) => ({ ...t, clips: [...t.clips] }) as Track);
    const textTrack = ensureTextTrack(tracks);
    for (const time of beats) {
      textTrack.clips = [...textTrack.clips, buildBeatTextClip(time, label)];
      added += 1;
    }
    let max = project.duration;
    for (const t of tracks) {
      for (const c of t.clips) {
        const end = c.trackStart + c.duration;
        if (end > max) max = end;
      }
    }
    return { ...project, tracks, duration: max };
  });
  return added;
}

function ensureFxTrack(tracks: Track[]): FxTrack {
  const found = tracks.find((t): t is FxTrack => t.kind === "effect");
  if (found) return found;
  const created: FxTrack = {
    id: newId(),
    kind: "effect",
    name: "FX",
    locked: false,
    muted: false,
    visible: true,
    height: TRACK_HEIGHT,
    clips: [],
  };
  tracks.push(created);
  return created;
}

export function blinkEffectAtBeats(beats: number[]): number {
  if (beats.length === 0) return 0;
  let added = 0;
  updateProject((project) => {
    const tracks = project.tracks.map((t) => ({ ...t, clips: [...t.clips] }) as Track);
    const fxTrack = ensureFxTrack(tracks);
    for (const time of beats) {
      const clip: EffectClip = {
        kind: "effect",
        id: newId(),
        trackStart: time,
        duration: 0.18,
        effects: [
          {
            id: newId(),
            mode: "transform",
            params: { brightness: 1, contrast: 1, saturation: 1, scale: 1.06, animation: "none" },
          },
        ],
      };
      fxTrack.clips = [...fxTrack.clips, clip];
      added += 1;
    }
    let max = project.duration;
    for (const t of tracks) {
      for (const c of t.clips) {
        const end = c.trackStart + c.duration;
        if (end > max) max = end;
      }
    }
    return { ...project, tracks, duration: max };
  });
  return added;
}
