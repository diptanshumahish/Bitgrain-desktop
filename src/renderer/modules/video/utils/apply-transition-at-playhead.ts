import { currentProjectSignal, selectedClipIdSignal } from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import { emitToast } from "./video-toast";
import {
  addTransitionAtCut,
  nearestCut,
  TRANSITION_LABELS,
  TRANSITION_KINDS,
} from "./transition-ops";
import type { ClipTransitionKind, VideoTrack } from "../types";

export { TRANSITION_KINDS, TRANSITION_LABELS };

// Keyboard and palette entry point. Aims at the cut nearest the playhead, on the
// selected clip's track if there is a selection, so it does the obvious thing
// without needing a cut clicked first.
export function applyTransitionAtPlayhead(kind: ClipTransitionKind): void {
  const project = currentProjectSignal.value;
  if (!project) return;

  const selectedId = selectedClipIdSignal.value;
  const ownerTrack = selectedId
    ? project.tracks.find(
        (t): t is VideoTrack =>
          t.kind === "video" && t.clips.some((c) => c.id === selectedId),
      )
    : undefined;

  const cut = nearestCut(project, currentTimeSignal.value, ownerTrack?.id);
  if (!cut) {
    emitToast("No cut to put a transition on. Two clips have to meet edge to edge.");
    return;
  }

  const result = addTransitionAtCut(cut.trackId, cut.from.id, cut.to.id, kind);
  if (!result.ok) {
    emitToast(result.reason ?? "Could not add the transition");
    return;
  }
  emitToast(
    `${TRANSITION_LABELS[kind]} · ${result.duration?.toFixed(2)}s`,
  );
}
