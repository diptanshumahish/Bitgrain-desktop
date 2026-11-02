import { imageMetaSignal } from "../../../state/image-store";
import type { LoopMotion } from "../../loop-settings";
import { buildLoopJob } from "../../engine/build-loop-job";
import { centerCropBox } from "@bitgrain/engine/loop/crop-box";
import type { FitSize } from "../../engine/loop-output-size";
import type { FrameSize, LoopRenderJob } from "../../engine/render-loop-frame";
import type { SoundFrameId } from "../sound-settings";
import { soundFrameAspect, soundFrameSize } from "./sound-frame-specs";

interface SoundJobRequest {
  motion: LoopMotion;
  frame: SoundFrameId;
  maxLongEdge: number;
  photoFit: FitSize;
}

const coverLongEdge = (size: FrameSize, aspect: number | null): number => {
  const meta = imageMetaSignal.value;
  if (!meta) return Math.max(size.width, size.height);
  const crop = centerCropBox(meta.width, meta.height, aspect);
  return Math.max(meta.width, meta.height) * (size.width / crop.width);
};

export const buildSoundJob = (request: SoundJobRequest): LoopRenderJob => {
  const size = soundFrameSize(request.frame, request.maxLongEdge);
  if (!size) return buildLoopJob(request.motion, request.maxLongEdge, request.photoFit);
  const aspect = soundFrameAspect(request.frame);
  return buildLoopJob(request.motion, coverLongEdge(size, aspect), () => size, aspect);
};
