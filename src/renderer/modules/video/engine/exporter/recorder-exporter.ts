import {
  attachExportRecorder,
  detachExportRecorder,
} from "../audio-engine";
import { previewCanvasSignal } from "../../store/preview-canvas-store";
import { currentProjectSignal } from "../../store/project-store";
import {
  isPlayingSignal,
  loopEnabledSignal,
  setPlaying,
} from "../../store/playback-store";
import {
  currentTimeSignal,
  setCurrentTime,
} from "../../store/timeline-store";
import {
  setExportProgress,
  exportProgressSignal,
} from "./export-types";
import { preloadProjectFonts } from "../../utils/font-loader";
import { resolveExportRange, rangeDuration } from "./support/export-range";
import { clampVideoDimensions, planRequiresVideoWatermark } from "./export-plan-gate";
import { drawWatermarkPill, preloadWatermarkLogo } from "../../../../engine/watermark";
import { emitModal } from "../../../../lib/event-bus";
import { registerWatermarkedExport, shouldPromptUpgrade } from "../../../../utils/upgrade-prompt";
import { trackEvent } from "../../../../lib/tracker";

const SETTLE_MS = 250;
const RECORDER_TIMESLICE_MS = 250;
const MIN_RATIO_DENOMINATOR = 0.001;
const STOP_GRACE_SECONDS = 1;
const MS_PER_SECOND = 1000;

function pickMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "video/webm";
}

function safeFileName(name: string, ext: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${slug || "untitled"}-${timestamp}.${ext}`;
}

interface ActiveExport {
  recorder: MediaRecorder;
  cancel: () => void;
}

let active: ActiveExport | null = null;

export async function startMediaRecorderExport(plan: string): Promise<void> {
  const project = currentProjectSignal.value;
  if (!project) return;
  if (project.duration <= 0) {
    setExportProgress({
      status: "error",
      error: "Add at least one clip to the timeline before exporting.",
    });
    return;
  }
  if (active) return;

  const canvas = previewCanvasSignal.value;
  if (!canvas) {
    setExportProgress({ status: "error", error: "Preview canvas not ready." });
    return;
  }

  const watermark = planRequiresVideoWatermark(plan);
  const gated = clampVideoDimensions(plan, canvas.width, canvas.height);
  const needsCompositing = watermark || gated.clamped;
  const watermarkLogo = watermark ? await preloadWatermarkLogo() : null;

  setExportProgress({
    status: "preparing",
    ratio: 0,
    message: "Preparing render…",
    downloadUrl: null,
    fileName: null,
    error: null,
  });

  setExportProgress({ message: "Loading fonts…" });
  await preloadProjectFonts(project);

  const range = resolveExportRange(project);
  const loopWasEnabled = loopEnabledSignal.value;
  loopEnabledSignal.value = false;
  setPlaying(false);
  setCurrentTime(range.start);
  await new Promise((r) => setTimeout(r, SETTLE_MS));

  const fps = project.fps;
  let recordCanvas: HTMLCanvasElement | null = null;
  let compositeRaf = 0;
  let captureSource: HTMLCanvasElement = canvas;
  if (needsCompositing) {
    recordCanvas = document.createElement("canvas");
    recordCanvas.width = Math.floor(gated.width / 2) * 2;
    recordCanvas.height = Math.floor(gated.height / 2) * 2;
    captureSource = recordCanvas;
  }

  const drawComposite = (): void => {
    const target = recordCanvas;
    if (!target) return;
    const ctx = target.getContext("2d");
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, target.width, target.height);
      if (watermark) drawWatermarkPill(ctx, target.width, target.height, watermarkLogo);
    }
    compositeRaf = requestAnimationFrame(drawComposite);
  };
  if (needsCompositing) drawComposite();

  const videoStream = captureSource.captureStream(fps);
  const audioStream = attachExportRecorder();

  const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
  if (audioStream) {
    tracks.push(...audioStream.getAudioTracks());
  }
  const combined = new MediaStream(tracks);

  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(combined, { mimeType });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  let cancelled = false;
  let timeUnsub: (() => void) | null = null;
  let stopTimer: ReturnType<typeof setTimeout> | null = null;

  const finish = () => {
    setPlaying(false);
    loopEnabledSignal.value = loopWasEnabled;
    if (timeUnsub) timeUnsub();
    if (stopTimer) clearTimeout(stopTimer);
    if (compositeRaf) cancelAnimationFrame(compositeRaf);
    detachExportRecorder();
    for (const t of tracks) t.stop();
    active = null;
  };

  recorder.onstop = () => {
    if (cancelled) {
      finish();
      setExportProgress({ status: "cancelled", message: "Export cancelled." });
      return;
    }
    setExportProgress({
      status: "finalizing",
      ratio: 1,
      message: "Encoding…",
    });
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const fileName = safeFileName(project.name, "webm");
    finish();
    setExportProgress({
      status: "done",
      ratio: 1,
      message: "Export complete.",
      downloadUrl: url,
      fileName,
    });
    if (watermark) {
      trackEvent("video", "watermark_gate_shown", {
        details: { context: "video_export", format: "webm", plan },
      });
      if (shouldPromptUpgrade(registerWatermarkedExport())) {
        emitModal({
          type: "post-export-upgrade",
          requestedLongEdge: Math.max(canvas.width, canvas.height),
          deliveredLongEdge: Math.max(captureSource.width, captureSource.height),
        });
      }
    }
  };

  recorder.onerror = (event) => {
    cancelled = true;
    finish();
    setExportProgress({
      status: "error",
      error: `Recorder error: ${(event as ErrorEvent).message ?? "unknown"}`,
    });
  };

  active = {
    recorder,
    cancel: () => {
      cancelled = true;
      try {
        recorder.stop();
      } catch {
        finish();
      }
    },
  };

  setExportProgress({
    status: "recording",
    ratio: 0,
    message: "Recording in real time…",
    startedAt: Date.now(),
  });

  recorder.start(RECORDER_TIMESLICE_MS);
  setCurrentTime(range.start);
  setPlaying(true);

  const totalDuration = rangeDuration(range);
  timeUnsub = currentTimeSignal.subscribe(() => {
    if (cancelled) return;
    const t = currentTimeSignal.value;
    const ratio = Math.max(0, Math.min(1, (t - range.start) / Math.max(MIN_RATIO_DENOMINATOR, totalDuration)));
    if (exportProgressSignal.value.status === "recording") {
      setExportProgress({ ratio });
    }
    if (t >= range.end && isPlayingSignal.value) setPlaying(false);
    if (t >= range.end && !isPlayingSignal.value) {
      try {
        recorder.stop();
      } catch {
        // already stopped
      }
    }
  });

  stopTimer = setTimeout(
    () => {
      if (cancelled) return;
      try {
        recorder.stop();
      } catch {
        // already stopped
      }
    },
    Math.ceil((totalDuration + STOP_GRACE_SECONDS) * MS_PER_SECOND),
  );
}

export function cancelMediaRecorderExport(): void {
  if (!active) return;
  active.cancel();
}
