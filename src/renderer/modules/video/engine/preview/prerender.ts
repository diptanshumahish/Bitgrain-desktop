import { signal } from "../../../../lib/signal";
import { currentProjectSignal } from "../../store/project-store";
import { isPlayingSignal } from "../../store/playback-store";
import { currentTimeSignal } from "../../store/timeline-store";
import { exportProgressSignal } from "../exporter/export-types";
import { renderCache, frameIndexFor, currentStateKey } from "./render-cache";
import {
  createPreviewScratch,
  renderPreviewFrame,
  type PreviewScratch,
} from "./preview-renderer";
import { releaseVideoElements } from "../video-element-pool";

// Background render, the desktop trick the web build had no budget for.
//
// While the editor is paused the machine is doing nothing, so it walks forward
// from the playhead rendering frames nobody has asked for yet and parks them in
// the render cache. Press play and those seconds come back as `drawImage` calls
// instead of full decode → engine → composite work, which is the difference
// between an effect-heavy timeline crawling and running clean.
//
// It only ever runs paused and idle: playback, scrubbing and export all own the
// machine ahead of it, and it yields the moment any of them starts.

// How far ahead of the playhead to keep warm.
const LOOKAHEAD_SECONDS = 12;
// Sit out this long after the last interaction before starting, so scrubbing
// never competes with a pre-render job for the pool.
const IDLE_DELAY_MS = 400;
// Breather between frames; keeps the pre-renderer from starving the UI thread's
// compositing even though the heavy work is on workers.
const FRAME_GAP_MS = 8;

const EXPORT_BUSY = new Set(["preparing", "recording", "finalizing"]);

export const prerenderActiveSignal = signal(false);

let scratch: PreviewScratch | null = null;
let canvas: HTMLCanvasElement | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let running = false;
let stopped = true;
let generation = 0;

function idle(): boolean {
  return (
    !stopped &&
    !isPlayingSignal.value &&
    !EXPORT_BUSY.has(exportProgressSignal.value.status) &&
    currentProjectSignal.value !== null
  );
}

// The next frame index worth rendering: the first uncached one inside the
// lookahead window, or null when the window is already warm.
function nextTargetFrame(): number | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  const fps = project.fps || 30;
  const start = frameIndexFor(currentTimeSignal.value, fps);
  const lastFrame = frameIndexFor(project.duration, fps);
  const end = Math.min(lastFrame, start + Math.ceil(LOOKAHEAD_SECONDS * fps));
  for (let frame = start; frame <= end; frame++) {
    if (!renderCache.has(frame)) return frame;
  }
  return null;
}

async function step(): Promise<void> {
  if (running) return;
  if (!idle()) {
    prerenderActiveSignal.value = false;
    return;
  }

  const project = currentProjectSignal.value;
  if (!project) return;

  const stateKey = currentStateKey();
  renderCache.setStateKey(stateKey);
  const frame = nextTargetFrame();
  if (frame === null) {
    prerenderActiveSignal.value = false;
    return;
  }

  const fps = project.fps || 30;
  const myGeneration = generation;
  running = true;
  prerenderActiveSignal.value = true;

  try {
    if (!scratch) scratch = createPreviewScratch();
    if (!canvas) canvas = document.createElement("canvas");
    if (canvas.width !== project.width) canvas.width = project.width;
    if (canvas.height !== project.height) canvas.height = project.height;

    const result = await renderPreviewFrame({
      project,
      time: frame / fps,
      playing: false,
      // Pre-rendered frames are the ones playback will show, so they are
      // rendered at full project resolution regardless of what the auto quality
      // controller has settled on for live scrubbing.
      processingWidth: project.width,
      scope: "prerender",
      target: canvas,
      scratch,
      isStale: () =>
        myGeneration !== generation || currentStateKey() !== stateKey || !idle(),
    });

    if (result.ok && myGeneration === generation && idle()) {
      // A frame with no engine work is not worth the memory; playback can
      // rebuild it from the decoder just as fast.
      if (result.processedLayers > 0) {
        const bitmap = await createImageBitmap(canvas);
        // An edit landing mid-render would have moved the cache to a new state
        // key, and these pixels belong to the old one.
        if (myGeneration === generation && currentStateKey() === stateKey) {
          renderCache.put(frame, bitmap);
        } else {
          bitmap.close();
        }
      } else {
        // Nothing to cache in this stretch: stop walking rather than spin
        // through thousands of trivially cheap frames.
        prerenderActiveSignal.value = false;
        running = false;
        return;
      }
    }
  } catch {
    // A frame that will not render (missing media, a decoder hiccup) should not
    // take the walker down; the next tick moves past it.
  } finally {
    running = false;
  }

  schedule(FRAME_GAP_MS);
}

function schedule(delay: number): void {
  if (timer !== null) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void step();
  }, delay);
}

// Any interaction (edit, scrub, play, export) restarts the idle countdown and
// invalidates whatever frame is mid-flight.
export function nudgePrerender(): void {
  generation++;
  if (stopped) return;
  schedule(IDLE_DELAY_MS);
}

export function startPrerender(): void {
  stopped = false;
  nudgePrerender();
}

export function stopPrerender(): void {
  stopped = true;
  generation++;
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  prerenderActiveSignal.value = false;
  scratch = null;
  canvas = null;
  releaseVideoElements("prerender");
}
