import type { VideoProject } from "../../types";

export function lockedClipIds(project: VideoProject): Set<string> {
  const ids = new Set<string>();
  for (const track of project.tracks) {
    if (!track.locked) continue;
    for (const clip of track.clips) ids.add(clip.id);
  }
  return ids;
}

export function isClipLocked(project: VideoProject, clipId: string): boolean {
  return lockedClipIds(project).has(clipId);
}

export function isTrackLocked(project: VideoProject, trackId: string): boolean {
  return project.tracks.some((track) => track.id === trackId && track.locked);
}

export function editableClipIds(project: VideoProject, ids: string[]): string[] {
  const locked = lockedClipIds(project);
  return ids.filter((id) => !locked.has(id));
}
