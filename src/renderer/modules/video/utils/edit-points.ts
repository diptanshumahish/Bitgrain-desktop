import type { VideoProject } from "../types";

// Edit points: every place on the timeline where something starts or ends.
// Jumping between these is how you move around a cut without dragging the
// playhead and hoping, and it is what the up/down arrows bind to.

const EDGE_EPSILON = 1e-4;

export function clipEdgesInProject(project: VideoProject): number[] {
  const edges: number[] = [0];
  for (const track of project.tracks) {
    for (const clip of track.clips) {
      edges.push(clip.trackStart);
      edges.push(clip.trackStart + clip.duration);
    }
  }
  return edges;
}

export function nextEdgeAfter(edges: number[], time: number): number | null {
  let best: number | null = null;
  for (const edge of edges) {
    if (edge <= time + EDGE_EPSILON) continue;
    if (best === null || edge < best) best = edge;
  }
  return best;
}

export function previousEdgeBefore(edges: number[], time: number): number | null {
  let best: number | null = null;
  for (const edge of edges) {
    if (edge >= time - EDGE_EPSILON) continue;
    if (best === null || edge > best) best = edge;
  }
  return best;
}
