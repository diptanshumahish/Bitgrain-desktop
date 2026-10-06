import type { TextClip, TextTrack, VideoProject } from "../../types";

export function activeTextClipsAt(
  project: VideoProject,
  time: number,
): TextClip[] {
  const result: TextClip[] = [];
  const tracks = project.tracks.filter(
    (t): t is TextTrack => t.kind === "text" && t.visible,
  );
  for (const track of tracks) {
    for (const clip of track.clips) {
      if (time >= clip.trackStart && time < clip.trackStart + clip.duration) {
        result.push(clip);
      }
    }
  }
  return result;
}
