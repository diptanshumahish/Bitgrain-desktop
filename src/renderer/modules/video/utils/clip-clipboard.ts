import {
  currentProjectSignal,
  selectedClipIdsSignal,
  setClipSelection,
  updateProject,
} from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import { clipboardSignal, setClipboard } from "../store/clipboard-store";
import type { ClipboardEntry } from "../store/clipboard-store";
import { deleteSelected } from "./edit-ops";
import { newId } from "./id";
import type { BaseClip, Track, TrackKind, VideoProject } from "../types";

function recomputeDuration(project: VideoProject): number {
  let max = 0;
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      const end = clip.trackStart + clip.duration;
      if (end > max) max = end;
    }
  }
  return max;
}

function collectEntries(ids: string[]): ClipboardEntry[] {
  const project = currentProjectSignal.value;
  if (!project) return [];
  const entries: ClipboardEntry[] = [];
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      if (ids.includes(clip.id)) {
        entries.push({ trackKind: track.kind, clip: structuredClone(clip) });
      }
    }
  }
  return entries;
}

export function copySelected(): void {
  const entries = collectEntries(selectedClipIdsSignal.value);
  if (entries.length > 0) setClipboard(entries);
}

export function cutSelected(): void {
  copySelected();
  deleteSelected();
}

function firstTrackOfKind(tracks: Track[], kind: TrackKind): Track | null {
  return tracks.find((track) => track.kind === kind && !track.locked) ?? null;
}

export function pasteClipboard(): void {
  const entries = clipboardSignal.value;
  if (entries.length === 0) return;
  const anchor = Math.min(...entries.map((entry) => entry.clip.trackStart));
  const playhead = currentTimeSignal.value;
  const pastedIds: string[] = [];

  updateProject((project) => {
    const tracks = project.tracks.map((track) => ({
      ...track,
      clips: [...track.clips],
    })) as Track[];

    for (const entry of entries) {
      const target = firstTrackOfKind(tracks, entry.trackKind);
      if (!target) continue;
      const clip = structuredClone(entry.clip) as BaseClip;
      clip.id = newId();
      clip.trackStart = playhead + (entry.clip.trackStart - anchor);
      (target.clips as BaseClip[]).push(clip);
      pastedIds.push(clip.id);
    }

    const next = { ...project, tracks };
    return { ...next, duration: recomputeDuration(next) };
  });

  if (pastedIds.length > 0) setClipSelection(pastedIds);
}
