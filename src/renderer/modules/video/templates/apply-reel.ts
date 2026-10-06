import { updateProject, selectedClipIdSignal } from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import { TRACK_HEIGHT } from "../constants";
import type {
  AudioTrack,
  EffectApplication,
  EffectClip,
  EffectParams,
  FxTrack,
  ImageClip,
  ImageTrack,
  MediaAsset,
  TextClip,
  TextTrack,
  Track,
  VideoClip,
  VideoTrack,
} from "../types";
import { newId } from "../utils/id";
import type { ReelOverlay, ReelSlot, VideoReelTemplate } from "./reel-types";

interface ApplyResult {
  ok: boolean;
  reason?: string;
}

function recomputeDuration(tracks: Track[]): number {
  let max = 0;
  for (const track of tracks) {
    for (const clip of track.clips) {
      const end = clip.trackStart + clip.duration;
      if (end > max) max = end;
    }
  }
  return max;
}

function ensureVideoTrack(tracks: Track[]): VideoTrack {
  const found = tracks.find((t): t is VideoTrack => t.kind === "video");
  if (found) return found;
  const created: VideoTrack = {
    id: newId(),
    kind: "video",
    name: "V1",
    locked: false,
    muted: false,
    visible: true,
    height: TRACK_HEIGHT,
    clips: [],
  };
  tracks.push(created);
  return created;
}

function ensureImageTrack(tracks: Track[]): ImageTrack {
  const found = tracks.find((t): t is ImageTrack => t.kind === "image");
  if (found) return found;
  const created: ImageTrack = {
    id: newId(),
    kind: "image",
    name: "IMG 1",
    locked: false,
    muted: false,
    visible: true,
    height: TRACK_HEIGHT,
    clips: [],
  };
  tracks.push(created);
  return created;
}

function ensureTextTrack(tracks: Track[]): TextTrack {
  const found = tracks.find((t): t is TextTrack => t.kind === "text");
  if (found) return found;
  const created: TextTrack = {
    id: newId(),
    kind: "text",
    name: "Aa",
    locked: false,
    muted: false,
    visible: true,
    height: TRACK_HEIGHT,
    clips: [],
  };
  tracks.push(created);
  return created;
}

function ensureFxTrack(tracks: Track[]): FxTrack {
  const found = tracks.find((t): t is FxTrack => t.kind === "effect");
  if (found) return found;
  const created: FxTrack = {
    id: newId(),
    kind: "effect",
    name: "FX",
    locked: false,
    muted: false,
    visible: true,
    height: TRACK_HEIGHT,
    clips: [],
  };
  tracks.push(created);
  return created;
}

function ensureAudioTrackExists(tracks: Track[]): void {
  const found = tracks.find((t): t is AudioTrack => t.kind === "audio");
  if (found) return;
  const created: AudioTrack = {
    id: newId(),
    kind: "audio",
    name: "A1",
    locked: false,
    muted: false,
    visible: true,
    height: TRACK_HEIGHT,
    clips: [],
  };
  tracks.push(created);
}

function buildClipAnimationEffect(slot: ReelSlot): EffectApplication | null {
  if (!slot.clipAnimation || slot.clipAnimation === "none") return null;
  return {
    id: newId(),
    mode: "transform",
    params: {
      brightness: 1,
      contrast: 1,
      saturation: 1,
      scale: 1,
      animation: slot.clipAnimation,
    },
  };
}

function buildVideoClip(slot: ReelSlot, asset: MediaAsset, base: number): VideoClip {
  const animEffect = buildClipAnimationEffect(slot);
  const sourceDuration = Math.max(asset.duration, 0.1);
  const duration = Math.min(slot.duration, sourceDuration);
  return {
    id: newId(),
    assetId: asset.id,
    trackStart: base + slot.trackStart,
    inPoint: 0,
    duration,
    effects: animEffect ? [animEffect] : [],
    transform: {
      x: slot.x ?? 0,
      y: slot.y ?? 0,
      scale: slot.scale ?? 1,
      rotation: slot.rotation ?? 0,
    },
    opacity: 1,
    audioDetached: false,
    fadeIn: slot.fadeIn,
    fadeOut: slot.fadeOut,
  };
}

function buildImageClip(slot: ReelSlot, asset: MediaAsset, base: number): ImageClip {
  return {
    id: newId(),
    assetId: asset.id,
    trackStart: base + slot.trackStart,
    duration: slot.duration,
    position: { x: 0.5, y: 0.5 },
    scale: slot.scale ?? 1,
    rotation: slot.rotation ?? 0,
    opacity: 1,
    filters: {},
    fadeIn: slot.fadeIn,
    fadeOut: slot.fadeOut,
  };
}

function buildTextClip(part: ReelOverlay, base: number): TextClip {
  return {
    id: newId(),
    trackStart: base + part.offset,
    duration: part.duration,
    text: part.text,
    font: part.font,
    size: part.size,
    color: part.color,
    weight: part.weight,
    position: part.position,
    align: part.align,
    animation: part.animation,
    fadeIn: part.fadeIn,
    fadeOut: part.fadeOut,
  };
}

function buildFxClip(
  band: VideoReelTemplate["fxBands"][number],
  base: number,
): EffectClip {
  const effects: EffectApplication[] = band.effects.map((spec) => ({
    id: newId(),
    mode: spec.mode,
    params: { brightness: 1, contrast: 1, saturation: 1, ...(spec.params as EffectParams) },
  }));
  return {
    kind: "effect",
    id: newId(),
    trackStart: base + band.offset,
    duration: band.duration,
    effects,
  };
}

export function applyReelTemplate(
  template: VideoReelTemplate,
  assets: MediaAsset[],
): ApplyResult {
  if (assets.length < template.minClips) {
    return { ok: false, reason: `Pick ${template.minClips} clip(s)` };
  }
  if (assets.length > template.maxClips) {
    return { ok: false, reason: `Pick at most ${template.maxClips} clip(s)` };
  }
  if (template.slots.length !== assets.length) {
    return { ok: false, reason: "Asset count does not match template slots" };
  }

  let firstClipId: string | null = null;

  updateProject((project) => {
    const tracks = project.tracks.map((t) => ({ ...t, clips: [...t.clips] }) as Track);
    const base = currentTimeSignal.value;

    template.slots.forEach((slot, idx) => {
      const asset = assets[idx];
      if (asset.kind === "video") {
        const track = ensureVideoTrack(tracks);
        const clip = buildVideoClip(slot, asset, base);
        track.clips = [...track.clips, clip];
        if (!firstClipId) firstClipId = clip.id;
      } else if (asset.kind === "image") {
        const track = ensureImageTrack(tracks);
        const clip = buildImageClip(slot, asset, base);
        track.clips = [...track.clips, clip];
        if (!firstClipId) firstClipId = clip.id;
      }
    });

    if (template.overlays.length > 0) {
      const track = ensureTextTrack(tracks);
      const next = [...track.clips];
      for (const overlay of template.overlays) {
        next.push(buildTextClip(overlay, base));
      }
      track.clips = next;
    }

    if (template.fxBands.length > 0) {
      const track = ensureFxTrack(tracks);
      const next = [...track.clips];
      for (const band of template.fxBands) {
        next.push(buildFxClip(band, base));
      }
      track.clips = next;
    }

    ensureAudioTrackExists(tracks);

    return { ...project, tracks, duration: recomputeDuration(tracks) };
  });

  if (firstClipId) selectedClipIdSignal.value = firstClipId;
  return { ok: true };
}
