import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { currentProjectSignal } from "../../store/project-store";
import { exportBitratePresetSignal, setExportProgress } from "./export-types";
import { captureFrameForExport, type CaptureResult } from "./frame-capture";
import { composeProjectFrame } from "./frame-compose";
import { TrackerStore } from "../tracking-motion";
import { renderProjectAudio } from "./render-audio";
import { buildH264Codec, defaultBitrateBps } from "./codec-config";
import { preloadProjectFonts } from "../../utils/font-loader";
import { preloadOverlayImages } from "../image-painter";
import { FrameWorkerPool, type ProcessResult } from "./worker-pool";
import { announceWatermarkedExport } from "./support/watermark-followup";
import { dispatchCapture, toComposedLayers } from "./support/frame-dispatch";
import { resolveExportRange, rangeDuration } from "./support/export-range";
import { MotionEstimator } from "../processing/motion-estimator";
import {
  AUDIO_BITRATE,
  AUDIO_CODEC,
  AUDIO_CONFIG,
  encodeAudioStream,
} from "./audio-encode";
import { awaitQueue, reportExportFailure, safeFileName } from "./exporter-utils";
import { clampVideoDimensions, planRequiresVideoWatermark } from "./export-plan-gate";
import { drawWatermarkPill, preloadWatermarkLogo } from "../../../../engine/watermark";

const PIPELINE_OVERHEAD = 1;

let cancelled = false;
let inFlight = false;

export function isWebCodecsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof VideoEncoder !== "undefined" &&
    typeof AudioEncoder !== "undefined" &&
    typeof OfflineAudioContext !== "undefined"
  );
}

export function cancelWebCodecsExport(): void {
  cancelled = true;
}

interface InflightFrame {
  index: number;
  time: number;
  capture: CaptureResult;
  results: Promise<ProcessResult | null>[];
}

export async function startWebCodecsExport(plan: string): Promise<void> {
  if (inFlight) return;
  if (!isWebCodecsSupported()) {
    setExportProgress({
      status: "error",
      error: "WebCodecs not supported in this browser.",
    });
    return;
  }
  const project = currentProjectSignal.value;
  if (!project) return;
  if (project.duration <= 0) {
    setExportProgress({
      status: "error",
      error: "Add at least one clip to the timeline before exporting.",
    });
    return;
  }

  inFlight = true;
  cancelled = false;
  setExportProgress({
    status: "preparing",
    ratio: 0,
    message: "Setting up encoders…",
    downloadUrl: null,
    fileName: null,
    error: null,
  });

  const fps = project.fps;
  const range = resolveExportRange(project);
  const totalFrames = Math.max(1, Math.ceil(rangeDuration(range) * fps));
  const gated = clampVideoDimensions(plan, project.width, project.height);
  const width = Math.floor(gated.width / 2) * 2;
  const height = Math.floor(gated.height / 2) * 2;
  const watermark = planRequiresVideoWatermark(plan);
  const watermarkLogo = watermark ? await preloadWatermarkLogo() : null;
  const videoCodec = buildH264Codec(width, height, fps);
  const videoBitrate = defaultBitrateBps(
    width,
    height,
    fps,
    exportBitratePresetSignal.value,
  );

  const renderCanvas = document.createElement("canvas");
  renderCanvas.width = width;
  renderCanvas.height = height;
  const scratchCanvas = document.createElement("canvas");
  const processedCanvas = document.createElement("canvas");
  const tracker = new TrackerStore();
  const motion = new MotionEstimator();

  const pool = new FrameWorkerPool();
  const pipelineDepth = pool.size + PIPELINE_OVERHEAD;

  let muxerError: string | null = null;
  let videoEncoder: VideoEncoder | null = null;
  let audioEncoder: AudioEncoder | null = null;

  try {
    setExportProgress({ message: "Loading fonts…" });
    await preloadProjectFonts(project);
    await preloadOverlayImages(project);
    if (cancelled) throw new Error("cancelled");

    setExportProgress({ message: "Rendering audio…" });
    const audioBuffer = await renderProjectAudio(project, range);
    if (cancelled) throw new Error("cancelled");

    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: { codec: "avc", width, height, frameRate: fps },
      ...(audioBuffer
        ? {
            audio: {
              codec: "aac" as const,
              sampleRate: AUDIO_CONFIG.sampleRate,
              numberOfChannels: AUDIO_CONFIG.channels,
            },
          }
        : {}),
      fastStart: "in-memory",
    });

    videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => {
        muxerError = e.message;
      },
    });
    videoEncoder.configure({
      codec: videoCodec,
      width,
      height,
      bitrate: videoBitrate,
      framerate: fps,
    });

    if (audioBuffer) {
      audioEncoder = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: (e) => {
          muxerError = e.message;
        },
      });
      audioEncoder.configure({
        codec: AUDIO_CODEC,
        sampleRate: AUDIO_CONFIG.sampleRate,
        numberOfChannels: AUDIO_CONFIG.channels,
        bitrate: AUDIO_BITRATE,
      });
    }

    setExportProgress({
      status: "recording",
      message: `Encoding 0/${totalFrames} frames (${pool.size} workers)…`,
      startedAt: Date.now(),
    });

    const keyframeInterval = Math.max(1, Math.round(fps * 2));
    const inflight: InflightFrame[] = [];
    let dispatchIdx = 0;

    const dispatchNext = async (): Promise<void> => {
      if (dispatchIdx >= totalFrames) return;
      const idx = dispatchIdx++;
      const t = range.start + idx / fps;
      const capture = await captureFrameForExport({
        project,
        time: t,
        scratchCanvas,
        fullWidth: width,
        motion,
      });

      const results = dispatchCapture(pool, capture);

      inflight.push({ index: idx, time: t, capture, results });
    };

    while (inflight.length < pipelineDepth && dispatchIdx < totalFrames) {
      if (cancelled) throw new Error("cancelled");
      await dispatchNext();
    }

    while (inflight.length > 0) {
      if (cancelled) throw new Error("cancelled");
      if (muxerError) throw new Error(muxerError);

      const next = inflight.shift();
      if (!next) break;
      const composedLayers = toComposedLayers(next.capture, await Promise.all(next.results));

      composeProjectFrame({
        project,
        time: next.time,
        layers: composedLayers,
        outputCanvas: renderCanvas,
        processedCanvas,
        tracker,
        wash: next.capture.wash,
      });

      if (watermark) {
        const wmCtx = renderCanvas.getContext("2d");
        if (wmCtx) drawWatermarkPill(wmCtx, width, height, watermarkLogo);
      }

      const timestampMicros = Math.round((next.index * 1_000_000) / fps);
      const frame = new VideoFrame(renderCanvas, {
        timestamp: timestampMicros,
        duration: Math.round(1_000_000 / fps),
      });

      if (videoEncoder.state === "closed") {
        frame.close();
        throw new Error(muxerError || "VideoEncoder closed unexpectedly");
      }

      videoEncoder.encode(frame, { keyFrame: next.index % keyframeInterval === 0 });
      frame.close();

      if (dispatchIdx < totalFrames) {
        await dispatchNext();
      }

      if (next.index % 4 === 3 || next.index === totalFrames - 1) {
        await awaitQueue(videoEncoder);
        const ratio = (next.index + 1) / totalFrames;
        setExportProgress({
          ratio,
          message: `Encoding ${next.index + 1}/${totalFrames} frames (${pool.size} workers)…`,
        });
      }
    }

    if (audioEncoder && audioBuffer) {
      setExportProgress({ message: "Encoding audio…" });
      await encodeAudioStream({
        audioEncoder,
        audioBuffer,
        isCancelled: () => cancelled,
        getMuxerError: () => muxerError,
      });
    }

    setExportProgress({ status: "finalizing", message: "Finalizing MP4…" });
    if (videoEncoder.state !== "closed") await videoEncoder.flush();
    if (audioEncoder && audioEncoder.state !== "closed") await audioEncoder.flush();
    if (muxerError) throw new Error(muxerError);

    muxer.finalize();
    const blob = new Blob([muxer.target.buffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    const fileName = safeFileName(project.name, "mp4");

    setExportProgress({
      status: "done",
      ratio: 1,
      message: "Export complete.",
      downloadUrl: url,
      fileName,
    });

    if (watermark) {
      announceWatermarkedExport({
        plan,
        format: "mp4",
        requestedLongEdge: Math.max(project.width, project.height),
        deliveredLongEdge: Math.max(width, height),
      });
    }
  } catch (err) {
    reportExportFailure(err);
  } finally {
    pool.terminate();
    if (videoEncoder && videoEncoder.state !== "closed") videoEncoder.close();
    if (audioEncoder && audioEncoder.state !== "closed") audioEncoder.close();
    inFlight = false;
    cancelled = false;
  }
}
