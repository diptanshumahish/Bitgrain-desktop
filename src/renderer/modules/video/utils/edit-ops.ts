import {
  selectedClipIdSignal,
  selectedClipIdsSignal,
  setClipSelection,
  clearClipSelection,
  updateProject,
} from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import { MIN_CLIP_DURATION } from "../constants";
import { newId } from "./id";
import { splitClip } from "./clip-edits/split-clip";
import { editableClipIds, isClipLocked } from "./clip-edits/track-lock";
import type { BaseClip, EffectClip, Track, VideoProject } from "../types";

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

function recomputeDuration(project: VideoProject): number {
  let max = 0;
  for (const t of project.tracks) {
    for (const c of t.clips) {
      const end = c.trackStart + c.duration;
      if (end > max) max = end;
    }
  }
  return max;
}

export function splitSelectedAtPlayhead(): void {
  const id = selectedClipIdSignal.value;
  if (!id) return;
  splitClipAtTime(id, currentTimeSignal.value);
}

export function splitClipAtTime(clipId: string, time: number): void {
  updateProject((project) => {
    if (isClipLocked(project, clipId)) return project;
    const tracks = project.tracks.map(cloneTrack);
    for (const track of tracks) {
      const clips = track.clips as BaseClip[];
      const idx = clips.findIndex((c) => c.id === clipId);
      if (idx < 0) continue;
      const localTime = time - clips[idx].trackStart;
      if (localTime <= MIN_CLIP_DURATION) return project;
      if (localTime >= clips[idx].duration - MIN_CLIP_DURATION) return project;
      clips.splice(idx, 1, ...splitClip(clips[idx], localTime));
      return { ...project, tracks };
    }
    return project;
  });
}

export function duplicateSelected(): void {
  const selected = selectedClipIdsSignal.value;
  if (selected.length === 0) return;
  const createdIds: string[] = [];
  updateProject((project) => {
    const ids = editableClipIds(project, selected);
    const tracks = project.tracks.map((track) => {
      if (!track.clips.some((clip) => ids.includes(clip.id))) return track;
      const cloned = cloneTrack(track);
      const next: BaseClip[] = [];
      for (const clip of cloned.clips as BaseClip[]) {
        next.push(clip);
        if (ids.includes(clip.id)) {
          const copy = {
            ...clip,
            id: newId(),
            trackStart: clip.trackStart + clip.duration,
          };
          next.push(copy);
          createdIds.push(copy.id);
        }
      }
      (cloned as { clips: BaseClip[] }).clips = next;
      return cloned;
    });
    const updated = { ...project, tracks };
    return { ...updated, duration: recomputeDuration(updated) };
  });
  if (createdIds.length > 0) setClipSelection(createdIds);
}

export function deleteSelected(): void {
  const selected = selectedClipIdsSignal.value;
  if (selected.length === 0) return;
  updateProject((project) => {
    const ids = editableClipIds(project, selected);
    const tracks: Track[] = project.tracks.map((t) => {
      const cloned = cloneTrack(t);
      cloned.clips = cloned.clips.filter(
        (c) => !ids.includes(c.id),
      ) as typeof cloned.clips;
      return cloned;
    });
    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });
  clearClipSelection();
}

export function rippleDeleteSelected(): void {
  const selected = selectedClipIdsSignal.value;
  if (selected.length === 0) return;
  updateProject((project) => {
    const ids = editableClipIds(project, selected);
    const tracks: Track[] = project.tracks.map((t) => {
      if (t.locked) return t;
      const cloned = cloneTrack(t);
      const deleted = cloned.clips.filter((c) => ids.includes(c.id));
      if (deleted.length === 0) return cloned;
      const remaining = cloned.clips.filter((c) => !ids.includes(c.id));
      cloned.clips = remaining.map((c) => {
        let shift = 0;
        for (const d of deleted) {
          if (d.trackStart < c.trackStart) shift += d.duration;
        }
        return { ...c, trackStart: Math.max(0, c.trackStart - shift) };
      }) as typeof cloned.clips;
      return cloned;
    });
    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });
  clearClipSelection();
}

export function addSpatialKeyframeAtPlayhead(): void {
  const id = selectedClipIdSignal.value;
  if (!id) return;
  const time = currentTimeSignal.value;
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    for (const track of tracks) {
      if (track.kind !== "effect") continue;
      const clip = track.clips.find((c) => c.id === id) as EffectClip;
      if (clip) {
        const localTime = time - clip.trackStart;
        if (!clip.keyframes) clip.keyframes = {};
        const fx = clip.effects[0];
        if (!fx) break;

        const props = ["scale", "x", "y", "rotation"];
        props.forEach((prop) => {
          if (!clip.keyframes![prop]) clip.keyframes![prop] = [];
          const val = (fx.params as Record<string, number>)[prop] ?? (prop === "scale" ? 1 : 0);
          clip.keyframes![prop] = clip.keyframes![prop].filter(
            (k) => Math.abs(k.time - localTime) > 0.05
          );
          clip.keyframes![prop].push({ time: localTime, value: val });
          clip.keyframes![prop].sort((a, b) => a.time - b.time);
        });
        break;
      }
    }
    return { ...project, tracks };
  });
}

export function clearKeyframesAtPlayhead(): void {
  const id = selectedClipIdSignal.value;
  if (!id) return;
  const time = currentTimeSignal.value;
  updateProject((project) => {
    const tracks = project.tracks.map(cloneTrack);
    for (const track of tracks) {
      if (track.kind !== "effect") continue;
      const clip = track.clips.find((c) => c.id === id) as EffectClip;
      if (clip && clip.keyframes) {
        const localTime = time - clip.trackStart;
        Object.keys(clip.keyframes).forEach((prop) => {
          clip.keyframes![prop] = clip.keyframes![prop].filter(
            (k) => Math.abs(k.time - localTime) > 0.1
          );
        });
        break;
      }
    }
    return { ...project, tracks };
  });
}

export function updateProjectSettings(patch: Partial<{ width: number; height: number; fps: number; name: string }>) {
  updateProject((p) => ({ ...p, ...patch }));
}
