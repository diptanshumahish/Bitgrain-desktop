import { updateProject, currentProjectSignal } from "../store/project-store";
import { newId } from "./id";
import { pruneOrphanTransitions } from "./transition-prune";
import type {
  ClipTransition,
  ClipTransitionKind,
  MediaAsset,
  VideoClip,
  VideoProject,
  VideoTrack,
} from "../types";

// Transitions, and the media arithmetic that decides whether one will fit.
//
// A centred transition asks each side of the cut for half its duration in
// *handle*: footage the clip owns but does not currently show. The outgoing clip
// needs media after its out point, the incoming clip needs media before its in
// point. A clip trimmed to the very end of its source has no handle and cannot
// take a transition on that side, which is why every NLE refuses some cuts.

export const CUT_EPSILON = 1e-4;
export const DEFAULT_TRANSITION_DURATION = 0.7;
export const MIN_TRANSITION_DURATION = 0.1;

export const TRANSITION_LABELS: Record<ClipTransitionKind, string> = {
  "cross-dissolve": "Cross dissolve",
  "dip-to-black": "Dip to black",
  "dip-to-white": "Dip to white",
  "wipe-left": "Wipe left",
  "wipe-right": "Wipe right",
};

export const TRANSITION_KINDS: ClipTransitionKind[] = [
  "cross-dissolve",
  "dip-to-black",
  "dip-to-white",
  "wipe-left",
  "wipe-right",
];

function assetFor(project: VideoProject, clip: VideoClip): MediaAsset | undefined {
  return project.mediaPool.find((a) => a.id === clip.assetId);
}

function speedOf(clip: VideoClip): number {
  return clip.speed ?? 1;
}

// Seconds of unused media after the clip's out point, in timeline time. Stills
// have no source limit, so they can extend indefinitely.
export function tailHandle(project: VideoProject, clip: VideoClip): number {
  const asset = assetFor(project, clip);
  if (!asset || asset.kind === "image") return Number.POSITIVE_INFINITY;
  const consumed = clip.inPoint + clip.duration * speedOf(clip);
  return Math.max(0, (asset.duration - consumed) / speedOf(clip));
}

// Seconds of unused media before the clip's in point, in timeline time.
export function headHandle(project: VideoProject, clip: VideoClip): number {
  const asset = assetFor(project, clip);
  if (!asset || asset.kind === "image") return Number.POSITIVE_INFINITY;
  return Math.max(0, clip.inPoint / speedOf(clip));
}

export interface CutCandidate {
  trackId: string;
  from: VideoClip;
  to: VideoClip;
  at: number;
  maxDuration: number;
  existing: ClipTransition | null;
}

// The longest transition this cut can carry: limited by the handles either side,
// and by the clips themselves, since a transition may not swallow a whole clip.
function maxDurationForCut(
  project: VideoProject,
  from: VideoClip,
  to: VideoClip,
): number {
  const halves = Math.min(tailHandle(project, from), headHandle(project, to));
  const byHandles = Number.isFinite(halves) ? halves * 2 : Number.POSITIVE_INFINITY;
  const byClips = Math.min(from.duration, to.duration);
  return Math.max(0, Math.min(byHandles, byClips));
}

// Every place on a video track where one clip ends exactly where the next begins.
export function cutsOnTrack(project: VideoProject, track: VideoTrack): CutCandidate[] {
  const ordered = [...track.clips].sort((a, b) => a.trackStart - b.trackStart);
  const cuts: CutCandidate[] = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    const from = ordered[i];
    const to = ordered[i + 1];
    const end = from.trackStart + from.duration;
    if (Math.abs(end - to.trackStart) > CUT_EPSILON) continue;
    cuts.push({
      trackId: track.id,
      from,
      to,
      at: end,
      maxDuration: maxDurationForCut(project, from, to),
      existing:
        track.transitions?.find(
          (t) => t.fromClipId === from.id && t.toClipId === to.id,
        ) ?? null,
    });
  }
  return cuts;
}

export function allCuts(project: VideoProject): CutCandidate[] {
  const cuts: CutCandidate[] = [];
  for (const track of project.tracks) {
    if (track.kind !== "video") continue;
    cuts.push(...cutsOnTrack(project, track));
  }
  return cuts;
}

// The cut nearest `time`, used by the keyboard and palette paths where there is
// no cut under a pointer to aim at.
export function nearestCut(
  project: VideoProject,
  time: number,
  trackId?: string,
): CutCandidate | null {
  let best: CutCandidate | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const cut of allCuts(project)) {
    if (trackId && cut.trackId !== trackId) continue;
    const distance = Math.abs(cut.at - time);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = cut;
    }
  }
  return best;
}

export interface AddTransitionResult {
  ok: boolean;
  reason?: string;
  duration?: number;
}

// Adds (or replaces) a transition on the cut between two clips. The requested
// duration is trimmed to what the media can actually supply rather than refused
// outright, which is what makes the default "just work" on most cuts.
export function addTransitionAtCut(
  trackId: string,
  fromClipId: string,
  toClipId: string,
  kind: ClipTransitionKind,
  requestedDuration = DEFAULT_TRANSITION_DURATION,
): AddTransitionResult {
  const project = currentProjectSignal.value;
  if (!project) return { ok: false, reason: "No project" };

  const track = project.tracks.find(
    (t): t is VideoTrack => t.id === trackId && t.kind === "video",
  );
  if (!track) return { ok: false, reason: "Transitions only apply to video tracks" };

  const from = track.clips.find((c) => c.id === fromClipId);
  const to = track.clips.find((c) => c.id === toClipId);
  if (!from || !to) return { ok: false, reason: "Cut not found" };

  const max = maxDurationForCut(project, from, to);
  if (max < MIN_TRANSITION_DURATION) {
    return {
      ok: false,
      reason:
        "Not enough spare footage either side of this cut. Trim one of the clips back to open up some handle.",
    };
  }
  const duration = Math.min(requestedDuration, max);

  updateProject((p) => ({
    ...p,
    tracks: p.tracks.map((t) => {
      if (t.id !== trackId || t.kind !== "video") return t;
      const others = (t.transitions ?? []).filter(
        (x) => !(x.fromClipId === fromClipId && x.toClipId === toClipId),
      );
      const transition: ClipTransition = {
        id: newId(),
        kind,
        duration,
        fromClipId,
        toClipId,
      };
      return { ...t, transitions: [...others, transition] };
    }),
  }));

  return { ok: true, duration };
}

export function removeTransition(trackId: string, transitionId: string): void {
  updateProject((p) => ({
    ...p,
    tracks: p.tracks.map((t) => {
      if (t.id !== trackId || t.kind !== "video") return t;
      return {
        ...t,
        transitions: (t.transitions ?? []).filter((x) => x.id !== transitionId),
      };
    }),
  }));
}

export function setTransitionDuration(
  trackId: string,
  transitionId: string,
  duration: number,
): void {
  const project = currentProjectSignal.value;
  if (!project) return;
  const track = project.tracks.find(
    (t): t is VideoTrack => t.id === trackId && t.kind === "video",
  );
  const transition = track?.transitions?.find((x) => x.id === transitionId);
  if (!track || !transition) return;
  const from = track.clips.find((c) => c.id === transition.fromClipId);
  const to = track.clips.find((c) => c.id === transition.toClipId);
  if (!from || !to) return;

  const max = maxDurationForCut(project, from, to);
  const next = Math.max(MIN_TRANSITION_DURATION, Math.min(duration, max));

  updateProject((p) => ({
    ...p,
    tracks: p.tracks.map((t) => {
      if (t.id !== trackId || t.kind !== "video") return t;
      return {
        ...t,
        transitions: (t.transitions ?? []).map((x) =>
          x.id === transitionId ? { ...x, duration: next } : x,
        ),
      };
    }),
  }));
}

export { pruneOrphanTransitions };
