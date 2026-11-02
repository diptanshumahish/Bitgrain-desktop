import type { EncodedAnimation } from "@bitgrain/studio-core/animate/encode-animation";
import { preloadWatermarkLogo } from "@bitgrain/engine/watermark/watermark";
import { shouldWatermarkExport } from "../../editor/export/plain-conversion/should-watermark-export";
import type { LoopMotion, LoopSettings } from "../loop-settings";
import { createLoopFrameSource } from "../engine/loop-frame-source";
import { exportFitSize, exportLongEdgeFor } from "../engine/loop-output-size";
import { uniqueFrameCount } from "../engine/loop-seeds";
import { encodeLoopFrames } from "./encode-loop-frames";

export type LoopExportPhase = "rendering" | "encoding";

interface LoopExportRequest {
  settings: LoopSettings;
  motion: LoopMotion;
  plan: string;
  signal: AbortSignal;
  onProgress: (phase: LoopExportPhase, ratio: number) => void;
}

const loadWatermark = async (plan: string): Promise<HTMLImageElement | null | undefined> =>
  shouldWatermarkExport(plan) ? preloadWatermarkLogo() : undefined;

export const exportLoop = async (request: LoopExportRequest): Promise<EncodedAnimation> => {
  const { settings, plan, signal, onProgress } = request;
  const frameCount = uniqueFrameCount(settings);
  const source = createLoopFrameSource({
    motion: request.motion,
    frameCount,
    targetLongEdge: exportLongEdgeFor(plan, settings.format),
    fitSize: exportFitSize(plan, settings.format),
    onFrame: (rendered) => onProgress("rendering", rendered / frameCount),
  });
  const stop = (): void => source.dispose();
  signal.addEventListener("abort", stop);
  try {
    const frames = await source.whenComplete;
    const watermarkLogo = await loadWatermark(plan);
    return await encodeLoopFrames({
      frames,
      settings,
      watermarkLogo,
      signal,
      onProgress: (ratio) => onProgress("encoding", ratio),
    });
  } finally {
    signal.removeEventListener("abort", stop);
    source.dispose();
  }
};
