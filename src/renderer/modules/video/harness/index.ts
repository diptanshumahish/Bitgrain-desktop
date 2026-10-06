import { activeFrameAt } from "../engine/frame-source";
import { pruneOrphanTransitions } from "../utils/transition-prune";
import type {
  ClipTransition,
  ClipTransitionKind,
  MediaAsset,
  VideoClip,
  VideoProject,
  VideoTrack,
} from "../types";

// A headless bench for the parts of the editor that are pure logic and would
// otherwise only ever be tested by eye: which clips a transition puts on screen,
// at what opacity, reading which moment of their source media.
//
// It runs in its own page rather than the engine's `harness.html`, which is
// deliberately engine-only and network-free for the determinism checks.

function asset(id: string, duration: number): MediaAsset {
  return {
    id,
    kind: "video",
    name: id,
    blobId: `blob-${id}`,
    duration,
  };
}

function clip(
  id: string,
  assetId: string,
  trackStart: number,
  duration: number,
  inPoint: number,
): VideoClip {
  return {
    id,
    assetId,
    trackStart,
    duration,
    inPoint,
    effects: [],
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    opacity: 1,
    audioDetached: false,
  };
}

export interface ScenarioOptions {
  kind: ClipTransitionKind;
  transitionDuration: number;
  // Handle either side: how much unused media each clip has beyond what it shows.
  headHandle: number;
  tailHandle: number;
}

// Two 4s clips meeting at t=4, each cut from a 4+handle second source.
function buildProject(options: ScenarioOptions): VideoProject {
  const clipDuration = 4;
  const sourceDuration = clipDuration + options.headHandle + options.tailHandle;

  const a = clip("clip-a", "asset-a", 0, clipDuration, options.headHandle);
  const b = clip("clip-b", "asset-b", clipDuration, clipDuration, options.headHandle);

  const transition: ClipTransition = {
    id: "t1",
    kind: options.kind,
    duration: options.transitionDuration,
    fromClipId: a.id,
    toClipId: b.id,
  };

  const track: VideoTrack = {
    id: "v1",
    kind: "video",
    name: "V1",
    locked: false,
    muted: false,
    visible: true,
    height: 56,
    clips: [a, b],
    transitions: [transition],
  };

  return {
    id: "p1",
    name: "harness",
    thumbnail: null,
    width: 1920,
    height: 1080,
    fps: 30,
    duration: clipDuration * 2,
    createdAt: 0,
    updatedAt: 0,
    tracks: [track],
    mediaPool: [asset("asset-a", sourceDuration), asset("asset-b", sourceDuration)],
  };
}

export interface SampledLayer {
  clipId: string;
  alpha: number;
  sourceTime: number;
  wipeProgress: number | null;
}

export interface SampledFrame {
  time: number;
  layers: SampledLayer[];
  washAlpha: number;
}

function sample(project: VideoProject, time: number): SampledFrame {
  const frame = activeFrameAt(project, time);
  return {
    time,
    layers: frame.layers.map((layer) => ({
      clipId: layer.clip.id,
      alpha: layer.transitionAlpha ?? 1,
      sourceTime: layer.sourceTime,
      wipeProgress: layer.wipe?.progress ?? null,
    })),
    washAlpha: frame.wash?.alpha ?? 0,
  };
}

// Samples the frame at the start, middle and end of the overlap, plus a moment
// clear of it, which is enough to characterise any of the transition kinds.
function scenario(options: ScenarioOptions): SampledFrame[] {
  const project = buildProject(options);
  const cut = 4;
  const half = options.transitionDuration / 2;
  return [
    sample(project, cut - half - 0.5),
    sample(project, cut - half + 0.001),
    sample(project, cut),
    sample(project, cut + half - 0.001),
    sample(project, cut + half + 0.5),
  ];
}

// Whether a transition survives the edit that broke its cut.
function pruneCase(mutate: (project: VideoProject) => VideoProject): number {
  const project = buildProject({
    kind: "cross-dissolve",
    transitionDuration: 1,
    headHandle: 1,
    tailHandle: 1,
  });
  const pruned = pruneOrphanTransitions(mutate(project));
  const track = pruned.tracks[0] as VideoTrack;
  return track.transitions?.length ?? 0;
}

const prunes = () => ({
  // A transition whose cut is intact stays.
  intact: pruneCase((p) => p),
  // Deleting one of the two clips takes the transition with it.
  clipDeleted: pruneCase((p) => ({
    ...p,
    tracks: p.tracks.map((t) => ({ ...t, clips: t.clips.slice(0, 1) }) as VideoTrack),
  })),
  // Moving a clip so the two no longer meet also drops it.
  cutSeparated: pruneCase((p) => ({
    ...p,
    tracks: p.tracks.map((t) => {
      const [a, b] = t.clips as VideoClip[];
      return { ...t, clips: [a, { ...b, trackStart: b.trackStart + 2 }] } as VideoTrack;
    }),
  })),
});

declare global {
  interface Window {
    __bitgrainVideoHarness?: {
      scenario(options: ScenarioOptions): SampledFrame[];
      prunes(): ReturnType<typeof prunes>;
    };
  }
}

window.__bitgrainVideoHarness = { scenario, prunes };
