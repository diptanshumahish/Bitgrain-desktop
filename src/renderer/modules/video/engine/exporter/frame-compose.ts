import type { VideoProject } from "../../types";
import { paintText } from "../text-painter";
import { activeTextClipsAt } from "../paint/active-text-clips";
import { activeTrackingClipsAt, paintTracking } from "../tracking-painter";
import type { TrackerStore } from "../tracking-motion";
import {
  activeImageOverlaysAt,
  paintImageOverlay,
} from "../image-painter";
import { getCachedImageBitmap, type FrameWash } from "../frame-source";
import { interpolateKeyframes } from "../../utils/keyframes";
import { clipFadeAlpha } from "../../utils/clip-fade";
import { layerFadeAlpha, paintDipColor } from "../paint/dip-color";
import type { LayerCapture } from "./frame-capture";

let snapshotCanvas: HTMLCanvasElement | null = null;

function getSnapshotCanvas(width: number, height: number): HTMLCanvasElement {
  if (!snapshotCanvas) snapshotCanvas = document.createElement("canvas");
  if (snapshotCanvas.width !== width) snapshotCanvas.width = width;
  if (snapshotCanvas.height !== height) snapshotCanvas.height = height;
  return snapshotCanvas;
}

function letterboxRect(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): { x: number; y: number; w: number; h: number } {
  const srcAspect = srcW / srcH;
  const dstAspect = dstW / dstH;
  if (srcAspect > dstAspect) {
    const h = dstW / srcAspect;
    return { x: 0, y: (dstH - h) / 2, w: dstW, h };
  }
  const w = dstH * srcAspect;
  return { x: (dstW - w) / 2, y: 0, w, h: dstH };
}

export interface ComposedLayer {
  capture: LayerCapture;
  buffer: ArrayBuffer | null;
  width: number;
  height: number;
  // Set when the layer's effect chain is a no-op, in which case the pixels never
  // left the GPU: no readback, no worker round trip, and the source is drawn at
  // its own resolution instead of through a resampled intermediate. `buffer` is
  // null for these.
  directSource?: CanvasImageSource | null;
}

type AnyCtx =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

function drawLayer(
  ctx: AnyCtx,
  processedCanvas: HTMLCanvasElement,
  layer: ComposedLayer,
  time: number,
  w: number,
  h: number,
): void {
  const { capture, buffer, width: pw, height: ph, directSource } = layer;
  // `paintable` is what actually gets drawn: either the untouched source, or the
  // canvas the processed pixels were written into.
  let paintable: CanvasImageSource;

  if (directSource) {
    paintable = directSource;
  } else {
    if (!buffer) return;
    const bytes = new Uint8ClampedArray(buffer);
    const expected = pw * ph * 4;
    if (bytes.length < expected) return;

    if (processedCanvas.width !== pw) processedCanvas.width = pw;
    if (processedCanvas.height !== ph) processedCanvas.height = ph;
    const pCtx = processedCanvas.getContext("2d");
    if (!pCtx) return;
    pCtx.clearRect(0, 0, pw, ph);
    const trimmed = bytes.length === expected ? bytes : bytes.slice(0, expected);
    pCtx.putImageData(new ImageData(trimmed, pw, ph), 0, 0);
    paintable = processedCanvas;
  }

  const { sourceWidth, sourceHeight, clip, activeEffects, transitionAlpha, wipe } = capture;
  const box = letterboxRect(sourceWidth, sourceHeight, w, h);
  const localTime = time - clip.trackStart;
  // A transitioning clip is deliberately outside its own span for half the
  // overlap, where `clipFadeAlpha` would return 0 and black it out. The
  // transition owns the alpha in that case.
  const inSpan = localTime >= 0 && localTime <= clip.duration;
  const fade =
    transitionAlpha === undefined || inSpan
      ? clipFadeAlpha(clip.duration, localTime, clip.fadeIn, clip.fadeOut)
      : 1;

  ctx.save();
  ctx.globalAlpha = layerFadeAlpha(clip, fade) * (clip.opacity ?? 1) * (transitionAlpha ?? 1);

  if (wipe) {
    // The incoming clip is revealed by a growing rectangle rather than blended.
    const revealed = w * wipe.progress;
    ctx.beginPath();
    if (wipe.edge === "left") ctx.rect(0, 0, revealed, h);
    else ctx.rect(w - revealed, 0, revealed, h);
    ctx.clip();
  }

  ctx.translate(w / 2, h / 2);

  for (const { effect, trackStart, duration, keyframes } of activeEffects) {
    if (effect.mode !== "transform") continue;
    const fxLocalTime = time - trackStart;
    const { animation = "none" } = effect.params;
    let scale = effect.params.scale ?? 1;
    let x = effect.params.x ?? 0;
    let y = effect.params.y ?? 0;
    let rotation = effect.params.rotation ?? 0;

    if (keyframes?.scale) {
      scale = interpolateKeyframes(keyframes.scale, fxLocalTime, scale);
    } else if (animation !== "none") {
      const progress = Math.min(1, Math.max(0, fxLocalTime / duration));
      if (animation === "zoom-in") scale *= 1 + progress * 0.5;
      if (animation === "zoom-out") scale *= 1 + (1 - progress) * 0.5;
    }
    if (keyframes?.rotation) {
      rotation = interpolateKeyframes(keyframes.rotation, fxLocalTime, rotation);
    }
    if (keyframes?.x) {
      x = interpolateKeyframes(keyframes.x, fxLocalTime, x);
    } else if (animation === "pan-left") {
      const progress = Math.min(1, Math.max(0, fxLocalTime / duration));
      x += (progress - 0.5) * 0.2;
    } else if (animation === "pan-right") {
      const progress = Math.min(1, Math.max(0, fxLocalTime / duration));
      x -= (progress - 0.5) * 0.2;
    }
    if (keyframes?.y) {
      y = interpolateKeyframes(keyframes.y, fxLocalTime, y);
    }

    ctx.scale(scale, scale);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(x * w, y * h);
  }

  const clipTransform = clip.transform;
  if (clipTransform) {
    ctx.scale(clipTransform.scale, clipTransform.scale);
    ctx.rotate((clipTransform.rotation * Math.PI) / 180);
    ctx.translate(clipTransform.x * w, clipTransform.y * h);
  }

  ctx.translate(-w / 2, -h / 2);
  // Processed pixels keep nearest-neighbour scaling: every texture the engine
  // makes (dither cells, halftone dots, glyph rasters) is meant to land hard.
  // An untouched source is just a scaled video frame, so it gets real filtering.
  ctx.imageSmoothingEnabled = Boolean(directSource);
  if (directSource) ctx.imageSmoothingQuality = "high";
  ctx.drawImage(paintable, box.x, box.y, box.w, box.h);
  ctx.restore();
  paintDipColor(ctx, clip, fade, w, h);
}

interface ComposeOpts {
  project: VideoProject;
  time: number;
  layers: ComposedLayer[];
  outputCanvas: HTMLCanvasElement | OffscreenCanvas;
  processedCanvas: HTMLCanvasElement;
  tracker?: TrackerStore;
  // Full-frame wash from a dip transition, drawn over the video layers but under
  // titles and overlays, so a lower third stays readable through the dip.
  wash?: FrameWash | null;
}

export function composeProjectFrame(opts: ComposeOpts): void {
  const { project, time, layers, outputCanvas, processedCanvas, tracker, wash } = opts;
  const ctx = outputCanvas.getContext("2d") as AnyCtx | null;
  if (!ctx) throw new Error("output canvas context unavailable");

  const w = outputCanvas.width;
  const h = outputCanvas.height;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  for (const layer of layers) {
    drawLayer(ctx, processedCanvas, layer, time, w, h);
  }

  if (wash && wash.alpha > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, wash.alpha);
    ctx.fillStyle = wash.color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  for (const { clip, asset } of activeImageOverlaysAt(project, time)) {
    const image = getCachedImageBitmap(asset);
    if (!image) continue;
    paintImageOverlay({
      clip,
      image,
      ctx,
      canvasWidth: w,
      canvasHeight: h,
      clipLocalTime: time - clip.trackStart,
    });
  }

  const trackingClips = activeTrackingClipsAt(project, time);
  if (trackingClips.length > 0 && tracker) {
    const snapshot = getSnapshotCanvas(w, h);
    const snapCtx = snapshot.getContext("2d");
    if (snapCtx) snapCtx.drawImage(outputCanvas, 0, 0);
    for (const clip of trackingClips) {
      paintTracking({
        clip,
        ctx,
        source: snapshot,
        tracker,
        canvasWidth: w,
        canvasHeight: h,
        clipLocalTime: time - clip.trackStart,
      });
    }
  }

  paintProjectText(ctx as CanvasRenderingContext2D, project, time, w / project.width);
}

function paintProjectText(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  time: number,
  pixelScale: number,
): void {
  ctx.save();
  ctx.scale(pixelScale, pixelScale);
  for (const clip of activeTextClipsAt(project, time)) {
    paintText({
      clip,
      ctx,
      canvasWidth: project.width,
      canvasHeight: project.height,
      clipLocalTime: time - clip.trackStart,
      pixelScale,
    });
  }
  ctx.restore();
}
