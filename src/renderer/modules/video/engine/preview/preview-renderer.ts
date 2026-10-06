import type { VideoProject } from "../../types";
import {
  activeFrameAt,
  layerEffectsAt,
  getImageBitmap,
  syncVideoToTime,
  type ActiveClipInfo,
} from "../frame-source";
import { acquireVideoElement, type VideoElementScope } from "../video-element-pool";
import {
  isIdentityChain,
  mergeEffectParams,
  resolveLayerProcessing,
  seekVideoExact,
  type LayerCapture,
} from "../exporter/frame-capture";
import { MotionEstimator } from "../processing/motion-estimator";
import { computeFrameSeeds } from "../processing/frame-seeds";
import { composeProjectFrame, type ComposedLayer } from "../exporter/frame-compose";
import { TrackerStore } from "../tracking-motion";
import { getPreviewPool } from "./preview-pool";

// The preview's frame renderer.
//
// The web build ran this on the main thread at a hard 540px cap, so the picture
// was soft and every effect stole time from React and the audio clock. Here the
// pixel work goes to a worker pool (one job per layer, all in flight at once)
// and the main thread is left with decode, composite and paint. Because it
// composes through the exporter's own `composeProjectFrame`, what the preview
// shows and what the encoder writes come off the same code path.

// Per-consumer scratch. Live preview and the background pre-renderer each keep
// their own, so neither can scribble on the other's intermediate canvases or
// motion history.
export interface PreviewScratch {
  sampleCanvas: HTMLCanvasElement;
  processedCanvas: HTMLCanvasElement;
  tracker: TrackerStore;
  motion: MotionEstimator;
}

export function createPreviewScratch(): PreviewScratch {
  return {
    sampleCanvas: document.createElement("canvas"),
    processedCanvas: document.createElement("canvas"),
    tracker: new TrackerStore(),
    motion: new MotionEstimator(),
  };
}

export interface PreviewFrameRequest {
  project: VideoProject;
  time: number;
  // While playing, video elements are left running and allowed to drift a frame
  // or two, which is what keeps playback fluid. Paused or pre-rendering, each
  // element is seeked exactly, so a still is always the true frame.
  playing: boolean;
  processingWidth: number;
  scope: VideoElementScope;
  target: HTMLCanvasElement;
  scratch: PreviewScratch;
  // Checked at every await boundary. A frame whose time is already stale is
  // abandoned rather than painted late over a newer one.
  isStale?: () => boolean;
}

interface PreparedLayer {
  capture: LayerCapture;
  directSource: CanvasImageSource | null;
  job: Promise<{ buffer: ArrayBuffer; width: number; height: number }> | null;
}

async function sourceForLayer(
  layer: ActiveClipInfo,
  req: PreviewFrameRequest,
  slot: number,
): Promise<{ source: CanvasImageSource; width: number; height: number } | null> {
  if (layer.asset.kind === "image") {
    const img = await getImageBitmap(layer.asset);
    if (!img) return null;
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  }
  if (layer.asset.kind !== "video") return null;

  if (req.playing && req.scope === "live") {
    const el = await syncVideoToTime(
      layer.asset,
      layer.sourceTime,
      true,
      layer.clip.speed ?? 1,
      slot,
    );
    if (!el.videoWidth || !el.videoHeight) return null;
    return { source: el, width: el.videoWidth, height: el.videoHeight };
  }

  const el = await acquireVideoElement(layer.asset.blobId, req.scope, slot);
  el.pause();
  await seekVideoExact(el, layer.sourceTime);
  if (!el.videoWidth || !el.videoHeight) return null;
  return { source: el, width: el.videoWidth, height: el.videoHeight };
}

function prepareLayer(
  layer: ActiveClipInfo,
  source: { source: CanvasImageSource; width: number; height: number },
  req: PreviewFrameRequest,
): PreparedLayer | null {
  const { project, time, processingWidth, scratch } = req;
  const activeEffects = layerEffectsAt(project, time, layer.clip);
  const merged = mergeEffectParams(activeEffects, time);
  const { modes } = merged;
  const { w, h, params } = resolveLayerProcessing(
    source.width, source.height, modes, merged.params, processingWidth,
  );

  const capture: LayerCapture = {
    clip: layer.clip,
    transitionAlpha: layer.transitionAlpha,
    wipe: layer.wipe,
    activeEffects,
    modes,
    params,
    seeds: computeFrameSeeds(params, time, 0),
    rawBuffer: new ArrayBuffer(0),
    processingWidth: w,
    processingHeight: h,
    sourceWidth: source.width,
    sourceHeight: source.height,
  };

  if (isIdentityChain(modes, params)) {
    return { capture, directSource: source.source, job: null };
  }

  const canvas = scratch.sampleCanvas;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source.source, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const motion = scratch.motion.estimate(imageData.data, w, h);
  capture.seeds = computeFrameSeeds(params, time, motion);
  const bytes = new Uint8ClampedArray(imageData.data);

  const job = getPreviewPool().process({
    buffer: bytes.buffer,
    width: w,
    height: h,
    modes,
    params,
    ...capture.seeds,
  });

  return { capture, directSource: null, job };
}

export interface PreviewFrameResult {
  // False when the request went stale mid-flight and the target was left alone.
  ok: boolean;
  // Layers that actually went through the engine. Zero means the frame was pure
  // decode-and-composite, which is cheap enough that caching it would cost more
  // memory than it saves.
  processedLayers: number;
}

// Renders one complete frame of `project` at `time` into `target`.
export async function renderPreviewFrame(
  req: PreviewFrameRequest,
): Promise<PreviewFrameResult> {
  const { project, time, target, scratch, isStale } = req;
  const stale = () => Boolean(isStale?.());

  const frame = activeFrameAt(project, time);
  const prepared: PreparedLayer[] = [];
  // Two layers of the same asset in one frame (a dissolve between clips cut from
  // one source) each need their own decoder, or they would seek each other away.
  const slotsUsed = new Map<string, number>();
  for (const layer of frame.layers) {
    const slot = slotsUsed.get(layer.asset.blobId) ?? 0;
    slotsUsed.set(layer.asset.blobId, slot + 1);
    let source: Awaited<ReturnType<typeof sourceForLayer>> = null;
    try {
      source = await sourceForLayer(layer, req, slot);
    } catch {
      source = null;
    }
    if (stale()) return { ok: false, processedLayers: 0 };
    if (!source) continue;
    const entry = prepareLayer(layer, source, req);
    if (entry) prepared.push(entry);
  }

  const layers: ComposedLayer[] = [];
  let processedLayers = 0;
  for (const entry of prepared) {
    if (!entry.job) {
      layers.push({
        capture: entry.capture,
        buffer: null,
        width: entry.capture.processingWidth,
        height: entry.capture.processingHeight,
        directSource: entry.directSource,
      });
      continue;
    }
    try {
      const result = await entry.job;
      layers.push({
        capture: entry.capture,
        buffer: result.buffer,
        width: result.width,
        height: result.height,
      });
      processedLayers++;
    } catch {
      // A failed worker job drops that layer for this frame only; the next
      // frame retries it. Better a missing layer for 30ms than a torn composite.
    }
  }

  if (stale()) return { ok: false, processedLayers };

  composeProjectFrame({
    project,
    time,
    layers,
    outputCanvas: target,
    processedCanvas: scratch.processedCanvas,
    tracker: scratch.tracker,
    wash: frame.wash,
  });
  return { ok: true, processedLayers };
}
