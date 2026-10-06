import type { VideoProject } from "../types";

// Kept free of store imports on purpose: `project-store` calls this on every
// update, and anything it pulls in would become a cycle.

const CUT_EPSILON = 1e-4;

// A transition names the two clips it joins. Any edit that deletes one of them,
// or moves them apart so they no longer share a cut, leaves a transition with
// nothing to do — it has to go with the edit rather than linger and render.
export function pruneOrphanTransitions(project: VideoProject): VideoProject {
  let changed = false;
  const tracks = project.tracks.map((track) => {
    if (track.kind !== "video" || !track.transitions?.length) return track;
    const kept = track.transitions.filter((transition) => {
      const from = track.clips.find((c) => c.id === transition.fromClipId);
      const to = track.clips.find((c) => c.id === transition.toClipId);
      if (!from || !to) return false;
      const end = from.trackStart + from.duration;
      if (Math.abs(end - to.trackStart) > CUT_EPSILON) return false;
      // A trim can shorten a clip below the overlap the transition needs.
      return transition.duration <= Math.min(from.duration, to.duration) + CUT_EPSILON;
    });
    if (kept.length === track.transitions.length) return track;
    changed = true;
    return { ...track, transitions: kept };
  });
  return changed ? { ...project, tracks } : project;
}
