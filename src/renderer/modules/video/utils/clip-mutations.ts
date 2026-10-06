import { updateProject } from "../store/project-store";
import {
  MIN_CLIP_DURATION,
  MIN_CLIP_SPEED,
  MAX_CLIP_SPEED,
} from "../constants";
import { clampFade } from "./clip-fade";
import type { Track, VideoProject, Keyframe } from "../types";
import { isClipLocked, lockedClipIds } from "./clip-edits/track-lock";

type FadeKind = "fadeIn" | "fadeOut";

export function cloneTrack(track: Track): Track {
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

export function sourceDurationLimit(
  project: VideoProject,
  clip: { id: string },
): number | null {
  const ref = clip as { assetId?: string; inPoint?: number };
  if (ref.assetId === undefined || ref.inPoint === undefined) return null;
  const asset = project.mediaPool.find((a) => a.id === ref.assetId);
  if (!asset || asset.kind === "image") return null;
  return asset.duration;
}

export function recomputeDuration(project: VideoProject): number {
  let max = 0;
  for (const t of project.tracks) {
    for (const c of t.clips) {
      const end = c.trackStart + c.duration;
      if (end > max) max = end;
    }
  }
  return max;
}

function patchClipInTracks(
  tracks: Track[],
  clipId: string,
  patch: { trackStart?: number; duration?: number; inPoint?: number },
): Track[] {
  return tracks.map((t) => {
    const idx = t.clips.findIndex((c) => c.id === clipId);
    if (idx < 0) return t;
    const cloned = cloneTrack(t);
    const clip = cloned.clips[idx];
    if (clip.id !== clipId) return cloned;
    const next: typeof clip = {
      ...clip,
      ...(patch.trackStart !== undefined ? { trackStart: patch.trackStart } : {}),
      ...(patch.duration !== undefined ? { duration: patch.duration } : {}),
    };
    if ("inPoint" in clip && patch.inPoint !== undefined) {
      (next as typeof clip & { inPoint: number }).inPoint = patch.inPoint;
    }
    cloned.clips[idx] = next;
    return cloned;
  });
}

export function moveClip(clipId: string, newStart: number): void {
  updateProject((project) => {
    if (isClipLocked(project, clipId)) return project;
    const tracks = patchClipInTracks(project.tracks, clipId, {
      trackStart: Math.max(0, newStart),
    });
    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });
}

export function moveClips(updates: { id: string; start: number }[]): void {
  if (updates.length === 0) return;
  updateProject((project) => {
    const locked = lockedClipIds(project);
    const starts = new Map(
      updates
        .filter((update) => !locked.has(update.id))
        .map((update): [string, number] => [update.id, Math.max(0, update.start)]),
    );
    const tracks = project.tracks.map((track) => {
      if (!track.clips.some((clip) => starts.has(clip.id))) return track;
      const cloned = cloneTrack(track);
      cloned.clips = cloned.clips.map((clip) =>
        starts.has(clip.id)
          ? { ...clip, trackStart: starts.get(clip.id)! }
          : clip,
      ) as typeof cloned.clips;
      return cloned;
    });
    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });
}

export function trimClipHead(clipId: string, newStartSec: number): void {
  updateProject((project) => {
    if (isClipLocked(project, clipId)) return project;
    let tracks = project.tracks;
    for (const t of project.tracks) {
      const clip = t.clips.find((c) => c.id === clipId);
      if (!clip) continue;

      const currentEnd = clip.trackStart + clip.duration;
      const limit = sourceDurationLimit(project, clip);
      const headSpeed = (clip as { speed?: number }).speed ?? 1;
      const minStart =
        limit !== null
          ? Math.max(
              0,
              clip.trackStart - (clip as { inPoint: number }).inPoint / headSpeed,
            )
          : 0;
      const newStart = Math.max(
        minStart,
        Math.min(newStartSec, currentEnd - MIN_CLIP_DURATION),
      );
      const newDuration = currentEnd - newStart;
      const deltaStart = newStart - clip.trackStart;

      const patch: { trackStart: number; duration: number; inPoint?: number } = {
        trackStart: newStart,
        duration: newDuration,
      };
      if ("inPoint" in clip) {
        const speed = (clip as { speed?: number }).speed ?? 1;
        patch.inPoint = Math.max(0, clip.inPoint + deltaStart * speed);
      }
      tracks = patchClipInTracks(project.tracks, clipId, patch);
      break;
    }
    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });
}

export function trimClipTail(clipId: string, newEndSec: number): void {
  updateProject((project) => {
    if (isClipLocked(project, clipId)) return project;
    let tracks = project.tracks;
    for (const t of project.tracks) {
      const clip = t.clips.find((c) => c.id === clipId);
      if (!clip) continue;

      let newDuration = Math.max(MIN_CLIP_DURATION, newEndSec - clip.trackStart);
      const limit = sourceDurationLimit(project, clip);
      if (limit !== null) {
        const inPoint = (clip as { inPoint: number }).inPoint;
        const speed = (clip as { speed?: number }).speed ?? 1;
        const maxDuration = Math.max(MIN_CLIP_DURATION, (limit - inPoint) / speed);
        newDuration = Math.min(newDuration, maxDuration);
      }
      tracks = patchClipInTracks(project.tracks, clipId, {
        duration: newDuration,
      });
      break;
    }
    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });
}

export function setClipSpeed(clipId: string, nextSpeed: number): void {
  const speed = Math.min(MAX_CLIP_SPEED, Math.max(MIN_CLIP_SPEED, nextSpeed));
  updateProject((project) => {
    const tracks = project.tracks.map((track) => {
      if (track.kind !== "video" && track.kind !== "audio") return track;
      const idx = track.clips.findIndex((c) => c.id === clipId);
      if (idx < 0) return track;
      const cloned = cloneTrack(track);
      const clip = cloned.clips[idx] as { speed?: number; duration: number };
      const oldSpeed = clip.speed ?? 1;
      const sourceConsumed = clip.duration * oldSpeed;
      const newDuration = Math.max(MIN_CLIP_DURATION, sourceConsumed / speed);
      cloned.clips[idx] = { ...clip, speed, duration: newDuration } as typeof cloned.clips[number];
      return cloned;
    });
    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });
}

export function setClipDuration(clipId: string, durationSec: number): void {
  updateProject((project) => {
    const tracks = project.tracks.map((track) => {
      const idx = track.clips.findIndex((c) => c.id === clipId);
      if (idx < 0) return track;
      const cloned = cloneTrack(track);
      const clip = cloned.clips[idx];
      let dur = Math.max(MIN_CLIP_DURATION, durationSec);
      const limit = sourceDurationLimit(project, clip);
      if (limit !== null) {
        const inPoint = (clip as { inPoint: number }).inPoint;
        const speed = (clip as { speed?: number }).speed ?? 1;
        dur = Math.min(dur, Math.max(MIN_CLIP_DURATION, (limit - inPoint) / speed));
      }
      cloned.clips[idx] = { ...clip, duration: dur } as typeof cloned.clips[number];
      return cloned;
    });
    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });
}

export function setClipFade(clipId: string, kind: FadeKind, valueSec: number): void {
  updateProject((project) => {
    if (isClipLocked(project, clipId)) return project;
    const tracks = project.tracks.map((track) => {
      const idx = track.clips.findIndex((c) => c.id === clipId);
      if (idx < 0) return track;
      if (track.kind === "effect") return track;
      const cloned = cloneTrack(track);
      const original = cloned.clips[idx];
      const duration = original.duration;
      const clamped = clampFade(valueSec, duration);
      const patched = { ...original, [kind]: clamped };
      cloned.clips[idx] = patched as typeof original;
      return cloned;
    });
    return { ...project, tracks };
  });
}

export function collectSnapTargets(
  project: VideoProject,
  excludeClipIds: Set<string> | null,
): number[] {
  const targets: number[] = [0];
  for (const t of project.tracks) {
    for (const c of t.clips) {
      if (excludeClipIds && excludeClipIds.has(c.id)) continue;
      targets.push(c.trackStart);
      targets.push(c.trackStart + c.duration);
      if ("keyframes" in c && (c as { keyframes?: Record<string, Keyframe[]> }).keyframes) {
        const kfs = (c as { keyframes: Record<string, Keyframe[]> }).keyframes;
        Object.values(kfs).forEach((kfList) => {
          kfList.forEach((kf) => {
            targets.push(c.trackStart + kf.time);
          });
        });
      }
    }
  }
  return targets;
}
