import { signal } from "../../../lib/signal";

// Preview quality and the live perf readout behind it.
//
// The web build processed every preview frame on the main thread at a hard 540px
// cap, which is why the picture looked soft and playback stuttered the moment an
// effect stack got real. On desktop the frame work happens on a worker pool, so
// the cap becomes a *budget* instead: render as large as the machine can hold the
// frame rate at, and only step down when it genuinely cannot keep up.

export type PreviewQuality = "auto" | "full" | "half" | "quarter";

// Scale ladder the auto controller walks. Values are fractions of the project's
// own resolution, so "full" on a 4K project really is 4K frame processing.
const SCALE_LADDER = [0.25, 0.35, 0.5, 0.7, 1] as const;
const FULL_INDEX = SCALE_LADDER.length - 1;

export const MIN_PROCESSING_WIDTH = 240;
export const MAX_PROCESSING_WIDTH = 3840;

export const previewQualitySignal = signal<PreviewQuality>("auto");
// The scale actually in force this frame, after the auto controller has had its say.
export const previewScaleSignal = signal<number>(1);
export const previewFpsSignal = signal(0);
export const previewFrameMsSignal = signal(0);
export const droppedFrameCountSignal = signal(0);
export const perfHudVisibleSignal = signal(false);

let ladderIndex = FULL_INDEX;
let emaFrameMs = 0;
// Frames to hold a level before considering another change, so the picture does
// not visibly pulse between resolutions on a borderline machine.
const SETTLE_FRAMES = 12;
let settle = 0;

const EMA_ALPHA = 0.2;

export function setPreviewQuality(quality: PreviewQuality): void {
  previewQualitySignal.value = quality;
  if (quality === "full") ladderIndex = FULL_INDEX;
  if (quality === "half") ladderIndex = 2;
  if (quality === "quarter") ladderIndex = 0;
  publishScale();
}

export function togglePerfHud(): void {
  perfHudVisibleSignal.value = !perfHudVisibleSignal.value;
}

function publishScale(): void {
  previewScaleSignal.value = SCALE_LADDER[ladderIndex];
}

// Called once per rendered preview frame. `budgetMs` is the frame period the
// project's fps asks for; anything slower than that is a dropped frame.
export function reportFrameTime(ms: number, budgetMs: number, playing: boolean): void {
  emaFrameMs = emaFrameMs === 0 ? ms : emaFrameMs + (ms - emaFrameMs) * EMA_ALPHA;
  previewFrameMsSignal.value = Math.round(emaFrameMs * 10) / 10;

  if (previewQualitySignal.value !== "auto") return;

  // Paused means there is no frame rate to hold, so quality wins outright: the
  // still the user is inspecting is always rendered at full project resolution.
  if (!playing) {
    if (ladderIndex !== FULL_INDEX) {
      ladderIndex = FULL_INDEX;
      publishScale();
    }
    settle = 0;
    return;
  }

  if (settle > 0) {
    settle--;
    return;
  }

  if (emaFrameMs > budgetMs * 1.2 && ladderIndex > 0) {
    ladderIndex--;
    settle = SETTLE_FRAMES;
    publishScale();
    return;
  }
  // Only climb when there is real headroom, otherwise the controller oscillates
  // around the budget and the resolution visibly breathes.
  if (emaFrameMs < budgetMs * 0.5 && ladderIndex < FULL_INDEX) {
    ladderIndex++;
    settle = SETTLE_FRAMES;
    publishScale();
  }
}

export function resetPreviewPerf(): void {
  emaFrameMs = 0;
  settle = 0;
  ladderIndex = FULL_INDEX;
  previewFpsSignal.value = 0;
  previewFrameMsSignal.value = 0;
  droppedFrameCountSignal.value = 0;
  publishScale();
}

// Processing width for a project of `projectWidth`, given the scale in force.
export function processingWidthFor(projectWidth: number): number {
  const scale = previewScaleSignal.value;
  const raw = Math.round(projectWidth * scale);
  return Math.max(MIN_PROCESSING_WIDTH, Math.min(MAX_PROCESSING_WIDTH, raw));
}
