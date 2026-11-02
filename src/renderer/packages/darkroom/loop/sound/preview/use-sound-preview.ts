import { useEffect, useRef, type RefObject } from "react";
import type { AudioRegion } from "@bitgrain/studio-core/animate/audio/render-audio-region";
import type { LoopFps, LoopMotion } from "../../loop-settings";
import { LOOP_PREVIEW_LONG_EDGE, previewFitSize } from "../../engine/loop-output-size";
import { loopPreviewProgressSignal } from "../../preview/loop-preview-store";
import type { SoundDrive, SoundFrameId } from "../sound-settings";
import { buildSoundJob } from "../engine/build-sound-job";
import { createSoundFrameCache, type SoundFrameCache } from "../engine/sound-frame-cache";
import type { SoundFramePlan } from "@bitgrain/engine/loop/sound-frame-plan";
import { createSoundPlayer, type SoundPlayer } from "./sound-player";
import { soundPlayingSignal, soundPreviewErrorSignal } from "./sound-preview-store";

interface SoundPreviewInputs {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  motion: LoopMotion;
  fps: LoopFps;
  drive: SoundDrive;
  frame: SoundFrameId;
  plan: SoundFramePlan;
  region: AudioRegion;
}

const PREVIEW_FAILED = "The preview could not render. Try a shorter length or reload the page.";

const isAbort = (error: unknown): boolean => error instanceof DOMException && error.name === "AbortError";

const reportProgress = (cache: SoundFrameCache, plan: SoundFramePlan): void => {
  const rendered = cache.renderedCount(plan.keys);
  loopPreviewProgressSignal.value = rendered < plan.keys.length ? { rendered, total: plan.keys.length } : null;
};

const reportFailure = (error: unknown): void => {
  if (!isAbort(error)) soundPreviewErrorSignal.value = PREVIEW_FAILED;
};

export const useSoundPreview = (inputs: SoundPreviewInputs): (() => void) => {
  const { canvasRef, motion, fps, drive, frame, plan, region } = inputs;
  const playerRef = useRef<SoundPlayer | null>(null);
  const cacheRef = useRef<SoundFrameCache | null>(null);
  const planRef = useRef(plan);
  const regionRef = useRef(region);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const job = buildSoundJob({ motion, frame, maxLongEdge: LOOP_PREVIEW_LONG_EDGE, photoFit: previewFitSize });
    const cache = createSoundFrameCache({ job, drive, onRendered: () => reportProgress(cache, planRef.current) });
    cacheRef.current = cache;
    playerRef.current = createSoundPlayer({ canvas, cache, fps });
    return () => {
      playerRef.current?.dispose();
      cache.dispose();
      playerRef.current = null;
      cacheRef.current = null;
      soundPlayingSignal.value = false;
      loopPreviewProgressSignal.value = null;
    };
  }, [canvasRef, motion, fps, drive, frame]);

  useEffect(() => {
    planRef.current = plan;
    const cache = cacheRef.current;
    if (!cache) return;
    soundPreviewErrorSignal.value = null;
    playerRef.current?.setPlan(plan);
    reportProgress(cache, plan);
    cache.request(plan.keys).catch(reportFailure);
  }, [plan, motion, fps, drive, frame]);

  useEffect(() => {
    regionRef.current = region;
    if (soundPlayingSignal.value) playerRef.current?.play(region);
  }, [region]);

  return () => {
    const player = playerRef.current;
    if (!player) return;
    if (soundPlayingSignal.value) player.pause();
    else player.play(regionRef.current);
    soundPlayingSignal.value = !soundPlayingSignal.value;
  };
};
