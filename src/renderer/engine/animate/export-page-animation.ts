import type { Layer, TemplateDef } from "../../data/studioTypes";
import type { PageAnimation } from "../../data/animation-types";
import { interpolatePageLayers, animationTotalDurationMs } from "./tween-layers";
import { renderToCanvas } from "../../components/studio/hooks/export/render-canvas";
import {
  encodeFramesMp4,
  encodeFramesWebm,
  isMp4Supported,
  type FrameRenderer,
} from "./export-frames";
import { encodeFramesGif } from "./export-gif";
import { buildAnimatedSvg } from "./export-svg";
import { buildLottie } from "./lottie/build-lottie";
import type { BitratePreset } from "../../modules/video/engine/exporter/codec-config";
import { getPlanLimits } from "../../config/plan-limits";
import { preloadWatermarkLogo, drawWatermarkPill } from "../watermark";
import { allowVectorExportOrPrompt, VectorExportLockedError } from "../../lib/plan-gate/vector-export-gate";

export type AnimationFormat = "mp4" | "webm" | "gif" | "svg" | "lottie";
export type AnimationQuality = BitratePreset;

export interface ExportAnimationArgs {
  template: TemplateDef;
  background: string;
  baseLayers: Layer[];
  image: string | null;
  animation: PageAnimation;
  width: number;
  height: number;
  format: AnimationFormat;
  scale?: number;
  quality?: AnimationQuality;
  plan: string;
  onProgress?: (ratio: number) => void;
}

const evenify = (value: number): number => Math.max(2, Math.round(value / 2) * 2);

export interface ExportedAnimation {
  blob: Blob;
  extension: string;
}

const MAX_FRAMES = 1800;

export async function exportPageAnimation(args: ExportAnimationArgs): Promise<ExportedAnimation> {
  const { template, background, baseLayers, image, animation, width, height, format, plan, onProgress } = args;
  const scale = args.scale ?? 1;
  const quality = args.quality ?? "high";
  const isVectorFormat = format === "svg" || format === "lottie";

  if (isVectorFormat && !allowVectorExportOrPrompt(plan, `animation_${format}_export`)) {
    throw new VectorExportLockedError();
  }

  if (format === "svg") {
    const blob = buildAnimatedSvg({ template, background, baseLayers, animation, width, height });
    onProgress?.(1);
    return { blob, extension: "svg" };
  }

  if (format === "lottie") {
    const blob = await buildLottie({ background, baseLayers, animation, width, height });
    onProgress?.(1);
    return { blob, extension: "json" };
  }

  const limits = getPlanLimits(plan);
  const longEdge = Math.max(width, height) * scale;
  const effectiveScale =
    limits.maxExportLongEdge && longEdge > limits.maxExportLongEdge
      ? scale * (limits.maxExportLongEdge / longEdge)
      : scale;
  const outW = evenify(width * effectiveScale);
  const outH = evenify(height * effectiveScale);

  const watermark = limits.watermark;
  const watermarkLogo = watermark ? await preloadWatermarkLogo() : null;

  const totalMs = animationTotalDurationMs(animation);
  const fps = animation.fps || 30;
  const frameCount = Math.min(MAX_FRAMES, Math.max(1, Math.round((totalMs / 1000) * fps)));

  const renderFrame: FrameRenderer = async (index) => {
    const time = (index / fps) * 1000;
    const layers = interpolatePageLayers(baseLayers, animation, time);
    const canvas = await renderToCanvas(template, background, layers, image, outW, outH);
    if (watermark) {
      const ctx = canvas.getContext("2d");
      if (ctx) drawWatermarkPill(ctx, outW, outH, watermarkLogo);
    }
    return canvas;
  };

  if (format === "gif") {
    const blob = await encodeFramesGif({ width: outW, height: outH, fps, frameCount, renderFrame, onProgress });
    return { blob, extension: "gif" };
  }

  if (format === "mp4" && isMp4Supported()) {
    const blob = await encodeFramesMp4({ width: outW, height: outH, fps, frameCount, renderFrame, bitrate: quality, onProgress });
    return { blob, extension: "mp4" };
  }

  const blob = await encodeFramesWebm({ width: outW, height: outH, fps, frameCount, renderFrame, onProgress });
  return { blob, extension: "webm" };
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
