import type { VideoClip, VideoProject } from "../../types";
import type { TransformMode } from "../../../../engine/types";
import type { EffectParams } from "../../types";
import {
  activeFrameAt,
  layerEffectsAt,
  getImageBitmap,
  type ActiveClipInfo,
  type ActiveEffect,
  type FrameWash,
} from "../frame-source";
import { acquireVideoElement } from "../video-element-pool";
import { mergeEffectParams } from "../processing/effect-params";
import { PREVIEW_MAX_WIDTH, pickProcessingSize } from "../processing/processing-size";
import { hasPixelMode } from "../processing/effect-kinds";
import { scaleSizeParams } from "../processing/scale-size-params";
import type { MotionEstimator } from "../processing/motion-estimator";
import { computeFrameSeeds } from "../processing/frame-seeds";
import type { ContextSeeds } from "../build-transform-context";

// The preview renderer imports these from here; they now live in processing/.
export { mergeEffectParams, pickProcessingSize };

const SEEK_MAX_WAIT_MS = 1500;
const FRAME_PAINT_MAX_WAIT_MS = 200;
const SEEK_TOLERANCE_SECONDS = 1 / 240;

export interface LayerCapture {
  clip: VideoClip;
  // Carried from the layer scan: a transition puts two clips from one track on
  // screen at once, each with its own alpha or wipe.
  transitionAlpha?: number;
  wipe?: { edge: "left" | "right"; progress: number };
  activeEffects: ActiveEffect[];
  modes: TransformMode[];
  params: Partial<EffectParams>;
  seeds: ContextSeeds;
  rawBuffer: ArrayBuffer;
  processingWidth: number;
  processingHeight: number;
  sourceWidth: number;
  sourceHeight: number;
}

export interface CaptureResult {
  layers: LayerCapture[];
  wash: FrameWash | null;
}

function armNextFramePainted(el: HTMLVideoElement): Promise<void> {
  return new Promise<void>((resolve) => {
    let done = false;
    const settle = () => {
      if (done) return;
      done = true;
      resolve();
    };
    if (typeof el.requestVideoFrameCallback === "function") {
      el.requestVideoFrameCallback(settle);
      setTimeout(settle, FRAME_PAINT_MAX_WAIT_MS);
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(settle));
  });
}

export async function seekVideoExact(
  el: HTMLVideoElement,
  targetTime: number,
): Promise<void> {
  const needsSeek = Math.abs(el.currentTime - targetTime) >= SEEK_TOLERANCE_SECONDS;
  const framePainted = armNextFramePainted(el);
  if (needsSeek) {
    await new Promise<void>((resolve) => {
      let done = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const settle = () => {
        if (done) return;
        done = true;
        if (timeout) clearTimeout(timeout);
        el.removeEventListener("seeked", settle);
        resolve();
      };
      el.addEventListener("seeked", settle);
      timeout = setTimeout(settle, SEEK_MAX_WAIT_MS);
      try {
        el.currentTime = targetTime;
      } catch {
        settle();
      }
    });
  }
  await framePainted;
}

const NEUTRAL_EPSILON = 1e-6;
const isOne = (v: number | undefined): boolean =>
  v === undefined || Math.abs(v - 1) < NEUTRAL_EPSILON;
const isZero = (v: number | undefined): boolean =>
  v === undefined || Math.abs(v) < NEUTRAL_EPSILON;

// True when running this chain through the engine would hand back exactly the
// pixels it was given: no texture modes, and every colour adjustment at its
// neutral value. Such a layer skips the readback and the worker entirely and is
// drawn straight from its source, which is both faster and sharper (no trip
// through a resampled intermediate).
//
// With no modes in the chain the engine only ever applies the preprocessing pass
// (brightness, contrast, saturation, hue) and the global palette enforcement, so
// those five are the whole test. `noise` needs the grain plugin, `lutId` needs
// the lut plugin, and `isColor` is read by plugins only.
export function isIdentityChain(
  modes: TransformMode[],
  params: Partial<EffectParams>,
): boolean {
  if (modes.length > 0) return false;
  return (
    isOne(params.contrast) &&
    isOne(params.brightness) &&
    isOne(params.saturation) &&
    isZero(params.hue) &&
    !params.palette
  );
}

// The web sizing rule, shared by export and the desktop preview so a project
// reads the same on both. Pixel-texture modes (dither, ascii, pixelate, ...)
// always run at the 540px reference width, because their grain *is* the working
// pixel; everything else runs at `targetWidth` with its size params (halftone
// cell, scanline spacing, ...) scaled up so the pattern keeps its proportions.
export function resolveLayerProcessing(
  srcW: number,
  srcH: number,
  modes: TransformMode[],
  params: EffectParams,
  targetWidth: number,
): { w: number; h: number; params: EffectParams } {
  const workingWidth = hasPixelMode(modes) ? Math.min(PREVIEW_MAX_WIDTH, targetWidth) : targetWidth;
  const { w, h } = pickProcessingSize(srcW, srcH, workingWidth);
  const previewWidth = pickProcessingSize(srcW, srcH, PREVIEW_MAX_WIDTH).w;
  return { w, h, params: scaleSizeParams(params, w / previewWidth) };
}

interface CaptureOpts {
  project: VideoProject;
  time: number;
  scratchCanvas: HTMLCanvasElement;
  fullWidth: number;
  motion: MotionEstimator;
}

async function captureLayer(
  opts: CaptureOpts,
  layer: ActiveClipInfo,
  slot: number,
): Promise<LayerCapture | null> {
  const { project, time, scratchCanvas, fullWidth, motion } = opts;
  let source: CanvasImageSource | null = null;
  let srcW = 0;
  let srcH = 0;

  if (layer.asset.kind === "video") {
    const el = await acquireVideoElement(layer.asset.blobId, "live", slot);
    el.pause();
    await seekVideoExact(el, layer.sourceTime);
    source = el;
    srcW = el.videoWidth || 0;
    srcH = el.videoHeight || 0;
  } else if (layer.asset.kind === "image") {
    const img = await getImageBitmap(layer.asset);
    if (img) {
      source = img;
      srcW = img.naturalWidth;
      srcH = img.naturalHeight;
    }
  }

  if (!source || srcW === 0 || srcH === 0) return null;

  const activeEffects = layerEffectsAt(project, time, layer.clip);
  const merged = mergeEffectParams(activeEffects, time);
  const modes = merged.modes;
  const { w, h, params } = resolveLayerProcessing(srcW, srcH, modes, merged.params, fullWidth);
  scratchCanvas.width = w;
  scratchCanvas.height = h;
  const ctx = scratchCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const layerMotion = motion.estimate(imageData.data, w, h);

  const bytes = new Uint8ClampedArray(imageData.data);

  return {
    clip: layer.clip,
    transitionAlpha: layer.transitionAlpha,
    wipe: layer.wipe,
    activeEffects,
    modes,
    params,
    seeds: computeFrameSeeds(params, time, layerMotion),
    rawBuffer: bytes.buffer,
    processingWidth: w,
    processingHeight: h,
    sourceWidth: srcW,
    sourceHeight: srcH,
  };
}

export async function captureFrameForExport(
  opts: CaptureOpts,
): Promise<CaptureResult> {
  const frame = activeFrameAt(opts.project, opts.time);
  const layers: LayerCapture[] = [];
  // Same reason as the preview: a transition can put two clips of one asset on
  // screen together, and each needs its own decoder to hold its own frame.
  const slotsUsed = new Map<string, number>();
  for (const layer of frame.layers) {
    const slot = slotsUsed.get(layer.asset.blobId) ?? 0;
    slotsUsed.set(layer.asset.blobId, slot + 1);
    const captured = await captureLayer(opts, layer, slot);
    if (captured) layers.push(captured);
  }
  return { layers, wash: frame.wash };
}
