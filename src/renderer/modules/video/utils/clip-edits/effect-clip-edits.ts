import {
  updateProject,
} from "../../store/project-store";
import { currentTimeSignal } from "../../store/timeline-store";
import { MODE_DEFAULTS } from "../../components/panels/effects/mode-options";
import type {
  EffectClip,
  EffectParams,
  FxTrack,
  Track,
  TransformMode,
  VideoProject,
} from "../../types";

export function findFxClip(
  project: VideoProject | null,
  clipId: string,
): { track: FxTrack; clip: EffectClip } | null {
  if (!project) return null;
  for (const track of project.tracks) {
    if (track.kind !== "effect") continue;
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { track, clip };
  }
  return null;
}

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

export function updateEffectParams(
  clipId: string,
  effectId: string,
  patch: Partial<EffectParams>,
): void {
  const time = currentTimeSignal.value;
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    for (const track of tracks) {
      if (track.kind !== "effect") continue;
      const clipIdx = track.clips.findIndex((c) => c.id === clipId);
      if (clipIdx < 0) continue;
      const originalClip = track.clips[clipIdx];
      const clip: EffectClip = {
        ...originalClip,
        keyframes: originalClip.keyframes
          ? { ...originalClip.keyframes }
          : undefined,
      };
      track.clips[clipIdx] = clip;

      const localTime = time - clip.trackStart;
      const remainingPatch: Partial<EffectParams> = { ...patch };

      for (const prop of Object.keys(patch) as (keyof EffectParams)[]) {
        const val = patch[prop];
        if (typeof val !== "number") continue;
        const hasAnyKeyframes =
          clip.keyframes && Object.keys(clip.keyframes).length > 0;
        if (hasAnyKeyframes || (clip.keyframes && clip.keyframes[prop])) {
          if (!clip.keyframes) clip.keyframes = {};
          if (!clip.keyframes[prop]) clip.keyframes[prop] = [];
          clip.keyframes[prop] = [...clip.keyframes[prop]];
          const existingIdx = clip.keyframes[prop].findIndex(
            (k) => Math.abs(k.time - localTime) < 0.1,
          );
          if (existingIdx >= 0) {
            clip.keyframes[prop][existingIdx] = {
              ...clip.keyframes[prop][existingIdx],
              value: val,
            };
          } else {
            clip.keyframes[prop].push({
              time: localTime,
              value: val,
            });
            clip.keyframes[prop].sort((a, b) => a.time - b.time);
          }
          delete remainingPatch[prop];
        }
      }

      clip.effects = clip.effects.map((e) =>
        e.id === effectId
          ? { ...e, params: { ...e.params, ...remainingPatch } }
          : e,
      );
      break;
    }
    return { ...project, tracks };
  });
}

export function updateEffectMode(
  clipId: string,
  effectId: string,
  mode: TransformMode,
): void {
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    for (const track of tracks) {
      if (track.kind !== "effect") continue;
      const clip = track.clips.find((c) => c.id === clipId);
      if (!clip) continue;
      const defaults = MODE_DEFAULTS[mode] ?? {};
      clip.effects = clip.effects.map((e) =>
        e.id === effectId
          ? { ...e, mode, params: { ...defaults, ...e.params } }
          : e,
      );
      break;
    }
    return { ...project, tracks };
  });
}

export function resetEffect(clipId: string, effectId: string, mode: TransformMode): void {
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    for (const track of tracks) {
      if (track.kind !== "effect") continue;
      const clip = track.clips.find((c) => c.id === clipId);
      if (!clip) continue;
      const defaults = MODE_DEFAULTS[mode] ?? {};
      clip.effects = clip.effects.map((e) =>
        e.id === effectId
          ? { ...e, params: { brightness: 1, contrast: 1, saturation: 1, ...defaults } }
          : e,
      );
      break;
    }
    return { ...project, tracks };
  });
}
