import type {
  VideoClip,
  VideoTrack,
  VideoProject,
  MediaAsset,
  EffectApplication,
  FxTrack,
  Keyframe,
  ClipTransitionKind,
} from "../types";
import { acquireVideoElement } from "./video-element-pool";
import { getMediaBlob } from "../utils/media-blob-store";
import { bumpAssetEpoch } from "./preview/asset-epoch";

export interface ActiveClipInfo {
  clip: VideoClip;
  asset: MediaAsset;
  sourceTime: number;
  // Set only while a transition is running over this clip. `alpha` multiplies the
  // clip's own opacity and fades; `wipe` clips the drawn rectangle instead.
  transitionAlpha?: number;
  wipe?: { edge: "left" | "right"; progress: number };
}

// A full-frame wash drawn over the composite, which is how dip-to-white works:
// both clips fade out through it and the next fades back in.
export interface FrameWash {
  color: string;
  alpha: number;
}

export interface ActiveFrame {
  layers: ActiveClipInfo[];
  wash: FrameWash | null;
}

export interface ActiveEffect {
  effect: EffectApplication;
  trackStart: number;
  duration: number;
  keyframes?: Record<string, Keyframe[]>;
}

export function effectTrackEffectsAt(
  project: VideoProject,
  time: number,
): ActiveEffect[] {
  const result: ActiveEffect[] = [];
  const fxTracks = project.tracks.filter(
    (t): t is FxTrack => t.kind === "effect" && t.visible,
  );
  for (const track of fxTracks) {
    for (const clip of track.clips) {
      if (time >= clip.trackStart && time < clip.trackStart + clip.duration) {
        for (const effect of clip.effects) {
          result.push({
            effect,
            trackStart: clip.trackStart,
            duration: clip.duration,
            keyframes: clip.keyframes,
          });
        }
      }
    }
  }
  return result;
}

export function clipOwnEffects(clip: VideoClip): ActiveEffect[] {
  return clip.effects.map((effect) => ({
    effect,
    trackStart: clip.trackStart,
    duration: clip.duration,
  }));
}

// Effects applied to a single video layer: global effect-track effects plus
// the clip's own effects.
export function layerEffectsAt(
  project: VideoProject,
  time: number,
  clip: VideoClip,
): ActiveEffect[] {
  return [...effectTrackEffectsAt(project, time), ...clipOwnEffects(clip)];
}

function layerFor(
  project: VideoProject,
  clip: VideoClip,
  time: number,
): ActiveClipInfo | null {
  const asset = project.mediaPool.find((a) => a.id === clip.assetId);
  if (!asset) return null;
  const speed = clip.speed ?? 1;
  // Deliberately not clamped to the clip's own span: during a transition one
  // side is played past its out point and the other before its in point, which
  // is exactly what the media handles either side of the cut are for.
  const sourceTime = Math.max(0, clip.inPoint + (time - clip.trackStart) * speed);
  return { clip, asset, sourceTime };
}

// Alpha for each side of a transition at `progress` (0 → 1 across the overlap).
function transitionAlphas(
  kind: ClipTransitionKind,
  progress: number,
): { from: number; to: number } {
  switch (kind) {
    case "dip-to-black":
    case "dip-to-white":
      // Two halves: the outgoing clip is gone by the midpoint and the incoming
      // one only starts after it, so the wash (or plain black) is briefly alone.
      return {
        from: Math.max(0, 1 - progress * 2),
        to: Math.max(0, progress * 2 - 1),
      };
    case "wipe-left":
    case "wipe-right":
      // A wipe reveals rather than blends: both sides stay fully opaque and the
      // incoming clip is clipped to a growing rectangle.
      return { from: 1, to: 1 };
    default:
      return { from: 1 - progress, to: progress };
  }
}

// Every visible video clip that contributes to `time`, ordered bottom layer
// first so the caller can composite top-over-bottom by drawing in array order.
// A track normally contributes one clip; while a transition is running it
// contributes two, which is the whole difference between a real transition and
// a pair of fades.
export function activeFrameAt(project: VideoProject, time: number): ActiveFrame {
  const layers: ActiveClipInfo[] = [];
  let wash: FrameWash | null = null;

  const visibleVideoTracks = project.tracks.filter(
    (t): t is VideoTrack => t.kind === "video" && t.visible,
  );

  for (const track of visibleVideoTracks) {
    let handled = false;

    for (const transition of track.transitions ?? []) {
      const from = track.clips.find((c) => c.id === transition.fromClipId);
      const to = track.clips.find((c) => c.id === transition.toClipId);
      if (!from || !to) continue;
      const cut = from.trackStart + from.duration;
      const half = transition.duration / 2;
      const start = cut - half;
      const end = cut + half;
      if (time < start || time >= end) continue;

      const progress = Math.min(1, Math.max(0, (time - start) / transition.duration));
      const alphas = transitionAlphas(transition.kind, progress);
      const outgoing = layerFor(project, from, time);
      const incoming = layerFor(project, to, time);

      if (transition.kind === "wipe-left" || transition.kind === "wipe-right") {
        if (outgoing) layers.push({ ...outgoing, transitionAlpha: 1 });
        if (incoming) {
          layers.push({
            ...incoming,
            transitionAlpha: 1,
            wipe: {
              edge: transition.kind === "wipe-left" ? "left" : "right",
              progress,
            },
          });
        }
      } else {
        if (outgoing && alphas.from > 0) {
          layers.push({ ...outgoing, transitionAlpha: alphas.from });
        }
        if (incoming && alphas.to > 0) {
          layers.push({ ...incoming, transitionAlpha: alphas.to });
        }
      }

      if (transition.kind === "dip-to-white") {
        // Peaks at the midpoint, where neither clip is on screen.
        wash = { color: "#ffffff", alpha: 1 - Math.abs(progress * 2 - 1) };
      }

      handled = true;
      break;
    }

    if (handled) continue;

    for (const clip of track.clips) {
      if (time >= clip.trackStart && time < clip.trackStart + clip.duration) {
        const layer = layerFor(project, clip, time);
        if (layer) layers.push(layer);
        break;
      }
    }
  }

  return { layers, wash };
}



const imageCache = new Map<string, HTMLImageElement>();

export function getCachedImageBitmap(asset: MediaAsset): HTMLImageElement | null {
  const cached = imageCache.get(asset.blobId);
  if (cached) return cached;
  void getImageBitmap(asset);
  return null;
}

export async function getImageBitmap(
  asset: MediaAsset,
): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(asset.blobId);
  if (cached) return cached;
  const blob = await getMediaBlob(asset.blobId);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image load failed"));
  });
  imageCache.set(asset.blobId, img);
  // Frames composed while this image was still decoding drew without it, so the
  // preview has to drop them.
  bumpAssetEpoch();
  return img;
}

export async function syncVideoToTime(
  asset: MediaAsset,
  sourceTime: number,
  shouldPlay: boolean,
  playbackRate = 1,
  slot = 0,
): Promise<HTMLVideoElement> {
  const el = await acquireVideoElement(asset.blobId, "live", slot);
  if (el.playbackRate !== playbackRate) {
    el.playbackRate = playbackRate;
  }
  const drift = Math.abs(el.currentTime - sourceTime);
  if (drift > 0.08) {
    el.currentTime = sourceTime;
  }
  if (shouldPlay && el.paused) {
    el.play().catch(() => {
      /* ignore autoplay rejection; will retry next tick */
    });
  } else if (!shouldPlay && !el.paused) {
    el.pause();
  }
  return el;
}
