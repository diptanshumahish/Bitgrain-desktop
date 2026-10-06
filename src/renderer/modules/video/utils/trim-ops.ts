import { updateProject } from "../store/project-store";
import { MIN_CLIP_DURATION } from "../constants";
import {
  cloneTrack,
  recomputeDuration,
  sourceDurationLimit,
} from "./clip-mutations";
import type { BaseClip, Track, VideoProject } from "../types";

// The four trim edits every desktop NLE has and a web timeline usually skips.
// Dragging a clip edge is only the simplest of them; these are the ones that
// keep the rest of the timeline honest while an edit point moves.
//
//   ripple  trim an edge and pull everything downstream with it, so no gap opens
//   roll    move the boundary between two clips, total duration unchanged
//   slip    change what the clip shows without moving it or its neighbours
//   slide   move the clip in the timeline, neighbours absorbing the difference
//
// All four operate inside one track and never touch another, which is what makes
// them safe to bind to a drag.

interface Located {
  track: Track;
  index: number;
  clip: BaseClip;
}

function locate(project: VideoProject, clipId: string): Located | null {
  for (const track of project.tracks) {
    const index = track.clips.findIndex((c) => c.id === clipId);
    if (index >= 0) return { track, index, clip: track.clips[index] };
  }
  return null;
}

function clipEnd(clip: BaseClip): number {
  return clip.trackStart + clip.duration;
}

function speedOf(clip: BaseClip): number {
  return (clip as { speed?: number }).speed ?? 1;
}

function hasInPoint(clip: BaseClip): clip is BaseClip & { inPoint: number } {
  return "inPoint" in clip;
}

// Applies `mutate` to the clips of the track holding `clipId`, then rebuilds the
// project. `mutate` works on a copied array and may return null to abort.
function editTrack(
  clipId: string,
  mutate: (clips: BaseClip[], index: number, project: VideoProject) => BaseClip[] | null,
): void {
  updateProject((project) => {
    const found = locate(project, clipId);
    if (!found) return project;
    const tracks = project.tracks.map((t) =>
      t.id === found.track.id ? cloneTrack(t) : t,
    );
    const target = tracks.find((t) => t.id === found.track.id);
    if (!target) return project;

    // Work in timeline order so "the clip after this one" means what it says,
    // whatever order the clips happen to sit in the array.
    const ordered = [...(target.clips as BaseClip[])].sort(
      (a, b) => a.trackStart - b.trackStart,
    );
    const index = ordered.findIndex((c) => c.id === clipId);
    if (index < 0) return project;

    const next = mutate(ordered, index, project);
    if (!next) return project;

    (target as { clips: BaseClip[] }).clips = next;
    const updated = { ...project, tracks };
    return { ...updated, duration: recomputeDuration(updated) };
  });
}

// How far a clip's in-point can move before it runs off either end of its source
// media. Returns null for clips with no source (text, effect, image).
function slipBounds(
  project: VideoProject,
  clip: BaseClip,
): { min: number; max: number } | null {
  if (!hasInPoint(clip)) return null;
  const limit = sourceDurationLimit(project, clip);
  if (limit === null) return null;
  const speed = speedOf(clip);
  const consumed = clip.duration * speed;
  return { min: 0, max: Math.max(0, limit - consumed) };
}

// Slip: the clip keeps its place and length; only the media inside it moves.
// Positive `delta` seconds shows later footage.
export function slipClip(clipId: string, delta: number): void {
  editTrack(clipId, (clips, index, project) => {
    const clip = clips[index];
    const bounds = slipBounds(project, clip);
    if (!bounds || !hasInPoint(clip)) return null;
    const target = clip.inPoint + delta * speedOf(clip);
    const inPoint = Math.max(bounds.min, Math.min(bounds.max, target));
    if (inPoint === clip.inPoint) return null;
    const next = [...clips];
    next[index] = { ...clip, inPoint } as BaseClip;
    return next;
  });
}

// Slide: the clip moves along the track; the clip before it grows or shrinks by
// the same amount and the clip after it does the opposite, so nothing else on
// the track shifts. Only slides as far as the neighbours can give.
export function slideClip(clipId: string, delta: number): void {
  editTrack(clipId, (clips, index) => {
    const clip = clips[index];
    const prev = index > 0 ? clips[index - 1] : null;
    const nextClip = index < clips.length - 1 ? clips[index + 1] : null;

    let move = delta;
    if (move < 0 && prev) {
      // Cannot eat the previous clip past its minimum length.
      const room = prev.duration - MIN_CLIP_DURATION;
      move = Math.max(move, -room);
    }
    if (move < 0 && !prev) {
      move = Math.max(move, -clip.trackStart);
    }
    if (move > 0 && nextClip) {
      const room = nextClip.duration - MIN_CLIP_DURATION;
      move = Math.min(move, room);
    }
    if (Math.abs(move) < 1e-6) return null;

    const out = [...clips];
    out[index] = { ...clip, trackStart: clip.trackStart + move };

    if (prev && Math.abs(clipEnd(prev) - clip.trackStart) < 1e-6) {
      out[index - 1] = { ...prev, duration: prev.duration + move };
    }
    if (nextClip && Math.abs(clipEnd(clip) - nextClip.trackStart) < 1e-6) {
      const patched: BaseClip = {
        ...nextClip,
        trackStart: nextClip.trackStart + move,
        duration: nextClip.duration - move,
      };
      if (hasInPoint(nextClip)) {
        (patched as BaseClip & { inPoint: number }).inPoint = Math.max(
          0,
          nextClip.inPoint + move * speedOf(nextClip),
        );
      }
      out[index + 1] = patched;
    }
    return out;
  });
}

// Roll: move the cut between this clip and the next one. This clip's tail and
// the next clip's head both land on `boundary`, so the pair occupies exactly the
// same span as before and nothing downstream moves.
export function rollEdit(clipId: string, boundary: number): void {
  editTrack(clipId, (clips, index, project) => {
    const clip = clips[index];
    const nextClip = index < clips.length - 1 ? clips[index + 1] : null;
    if (!nextClip) return null;
    // Only a real shared cut can be rolled; a gap between the two is not one.
    if (Math.abs(clipEnd(clip) - nextClip.trackStart) > 1e-6) return null;

    const minBoundary = clip.trackStart + MIN_CLIP_DURATION;
    const maxBoundary = clipEnd(nextClip) - MIN_CLIP_DURATION;

    // Neither side may be rolled past the end of its own source media.
    let limitedMax = maxBoundary;
    const leftLimit = sourceDurationLimit(project, clip);
    if (leftLimit !== null && hasInPoint(clip)) {
      const available = (leftLimit - clip.inPoint) / speedOf(clip);
      limitedMax = Math.min(limitedMax, clip.trackStart + available);
    }
    let limitedMin = minBoundary;
    if (hasInPoint(nextClip)) {
      const headroom = nextClip.inPoint / speedOf(nextClip);
      limitedMin = Math.max(limitedMin, nextClip.trackStart - headroom);
    }

    const at = Math.max(limitedMin, Math.min(limitedMax, boundary));
    const delta = at - clipEnd(clip);
    if (Math.abs(delta) < 1e-6) return null;

    const out = [...clips];
    out[index] = { ...clip, duration: clip.duration + delta };
    const patched: BaseClip = {
      ...nextClip,
      trackStart: at,
      duration: nextClip.duration - delta,
    };
    if (hasInPoint(nextClip)) {
      (patched as BaseClip & { inPoint: number }).inPoint = Math.max(
        0,
        nextClip.inPoint + delta * speedOf(nextClip),
      );
    }
    out[index + 1] = patched;
    return out;
  });
}

// Ripple trim on the head: the clip's start moves and every clip after it on the
// track slides by the same amount, so the cut closes instead of leaving a hole.
export function rippleTrimHead(clipId: string, newStart: number): void {
  editTrack(clipId, (clips, index) => {
    const clip = clips[index];
    const end = clipEnd(clip);
    let start = Math.min(newStart, end - MIN_CLIP_DURATION);

    if (hasInPoint(clip)) {
      const headroom = clip.inPoint / speedOf(clip);
      start = Math.max(start, clip.trackStart - headroom);
    }
    const prev = index > 0 ? clips[index - 1] : null;
    start = Math.max(start, prev ? clipEnd(prev) - clip.duration : 0, 0);

    const delta = start - clip.trackStart;
    if (Math.abs(delta) < 1e-6) return null;

    const patched: BaseClip = {
      ...clip,
      trackStart: start,
      duration: end - start,
    };
    if (hasInPoint(clip)) {
      (patched as BaseClip & { inPoint: number }).inPoint = Math.max(
        0,
        clip.inPoint + delta * speedOf(clip),
      );
    }

    const out = [...clips];
    out[index] = patched;
    // The head moved by `delta`; pulling the tail back by the same amount is what
    // makes this a ripple rather than a plain trim.
    for (let i = index + 1; i < out.length; i++) {
      out[i] = { ...out[i], trackStart: Math.max(0, out[i].trackStart + delta) };
    }
    return out;
  });
}

// Ripple trim on the tail: same idea from the other edge.
export function rippleTrimTail(clipId: string, newEnd: number): void {
  editTrack(clipId, (clips, index, project) => {
    const clip = clips[index];
    let duration = Math.max(MIN_CLIP_DURATION, newEnd - clip.trackStart);

    const limit = sourceDurationLimit(project, clip);
    if (limit !== null && hasInPoint(clip)) {
      const available = (limit - clip.inPoint) / speedOf(clip);
      duration = Math.min(duration, Math.max(MIN_CLIP_DURATION, available));
    }

    const delta = duration - clip.duration;
    if (Math.abs(delta) < 1e-6) return null;

    const out = [...clips];
    out[index] = { ...clip, duration };
    for (let i = index + 1; i < out.length; i++) {
      out[i] = { ...out[i], trackStart: Math.max(0, out[i].trackStart + delta) };
    }
    return out;
  });
}

// Closes the gap between a clip and whatever precedes it, pulling the rest of the
// track along. The keyboard counterpart to dragging a clip left until it snaps.
export function closeGapBefore(clipId: string): void {
  editTrack(clipId, (clips, index) => {
    const clip = clips[index];
    const prev = index > 0 ? clips[index - 1] : null;
    const target = prev ? clipEnd(prev) : 0;
    const delta = target - clip.trackStart;
    if (delta >= -1e-6) return null;

    const out = [...clips];
    for (let i = index; i < out.length; i++) {
      out[i] = { ...out[i], trackStart: Math.max(0, out[i].trackStart + delta) };
    }
    return out;
  });
}
