import { signal } from "../../../lib/signal";
import { pruneOrphanTransitions } from "../utils/transition-prune";
import type { VideoProject } from "../types";

export const currentProjectSignal = signal<VideoProject | null>(null);
// Bumped on every structural change to the project. The render cache keys every
// cached frame on it, so one increment invalidates the whole cache without
// walking it, and a frame rendered before an edit can never be shown after one.
export const projectRevisionSignal = signal(0);
export const projectLoadingSignal = signal(false);
export const projectErrorSignal = signal<string | null>(null);
export const selectedClipIdSignal = signal<string | null>(null);
export const selectedClipIdsSignal = signal<string[]>([]);

selectedClipIdSignal.subscribe(() => {
  const id = selectedClipIdSignal.value;
  const ids = selectedClipIdsSignal.value;
  if (id === null) {
    if (ids.length > 0) selectedClipIdsSignal.value = [];
    return;
  }
  if (ids.includes(id)) return;
  selectedClipIdsSignal.value = [id];
});

export function selectClip(id: string): void {
  selectedClipIdsSignal.value = [id];
  selectedClipIdSignal.value = id;
}

export function toggleClipSelection(id: string): void {
  const ids = selectedClipIdsSignal.value;
  if (ids.includes(id)) {
    const next = ids.filter((existing) => existing !== id);
    selectedClipIdsSignal.value = next;
    selectedClipIdSignal.value = next.length > 0 ? next[next.length - 1] : null;
    return;
  }
  selectedClipIdsSignal.value = [...ids, id];
  selectedClipIdSignal.value = id;
}

export function setClipSelection(ids: string[]): void {
  selectedClipIdsSignal.value = [...ids];
  selectedClipIdSignal.value = ids.length > 0 ? ids[ids.length - 1] : null;
}

export function clearClipSelection(): void {
  selectedClipIdsSignal.value = [];
  selectedClipIdSignal.value = null;
}

export function setCurrentProject(project: VideoProject | null): void {
  currentProjectSignal.value = project;
  projectRevisionSignal.value++;
}

export function updateProject(
  mutator: (project: VideoProject) => VideoProject,
): void {
  const current = currentProjectSignal.value;
  if (!current) return;
  const mutated = mutator(current);
  if (mutated === current) return;
  // Transitions reference the pair of clips they join, so every edit gets swept
  // for ones the edit just orphaned. Cheaper and far more reliable than asking
  // each of the twenty-odd edit paths to remember.
  const next = pruneOrphanTransitions(mutated);
  next.updatedAt = Date.now();
  currentProjectSignal.value = next;
  projectRevisionSignal.value++;
}
