import { useEffect } from "react";
import { previewLoadingSignal } from "../state/image-store";
import { supportsWorker } from "@bitgrain/engine/preview/render-helpers";
import type { WorkerResult } from "@bitgrain/engine/preview/types";
import { createPreviewLane, resetLane, type PreviewLane } from "./progressive/preview-lane";
import { flushPendingFull, type PreviewLanes } from "./progressive/dispatch-preview";
import { createDraftBitmap } from "./progressive/draft-bitmap";
import { loadCompactSource, type CompactSource } from "./progressive/compact-source";
import { resetForNewImage, type ProgressiveState } from "./progressive/progressive-state";
import { markPreviewDraft, setFullRenderFlusher } from "./progressive/full-preview-gate";
import { spawnTransformWorker } from "@bitgrain/engine/core/spawn-transform-worker";

export type LaneKind = keyof PreviewLanes;

interface UsePreviewWorkerArgs {
  compact: boolean;
  lanesRef: React.MutableRefObject<PreviewLanes | null>;
  progressRef: React.MutableRefObject<ProgressiveState>;
  handleResultRef: React.MutableRefObject<(kind: LaneKind, result: WorkerResult) => void>;
}

const wireLane = (
  kind: LaneKind,
  lane: PreviewLane,
  handleResultRef: UsePreviewWorkerArgs["handleResultRef"],
): void => {
  lane.worker.onmessage = (event: MessageEvent) => {
    if (event.data.type === "result") handleResultRef.current(kind, event.data);
  };
  const fail = (): void => {
    resetLane(lane);
    previewLoadingSignal.value = false;
  };
  lane.worker.onerror = (event) => {
    console.error("preview worker error:", event.message);
    fail();
  };
  lane.worker.onmessageerror = fail;
};

const spawnLanes = (): PreviewLanes | null => {
  try {
    return { full: createPreviewLane(spawnTransformWorker()), draft: createPreviewLane(spawnTransformWorker()) };
  } catch {
    return null;
  }
};

export const usePreviewWorker = ({ compact, lanesRef, progressRef, handleResultRef }: UsePreviewWorkerArgs): void => {
  useEffect(() => {
    if (!supportsWorker || compact) return;
    const lanes = spawnLanes();
    if (!lanes) return;
    wireLane("full", lanes.full, handleResultRef);
    wireLane("draft", lanes.draft, handleResultRef);
    lanesRef.current = lanes;
    const progress = progressRef.current;
    setFullRenderFlusher(() => flushPendingFull(lanes, progress));

    return () => {
      setFullRenderFlusher(() => {});
      markPreviewDraft(false);
      window.clearTimeout(progress.fullTimer);
      lanes.full.worker.terminate();
      lanes.draft.worker.terminate();
      lanesRef.current = null;
    };
  }, [compact, lanesRef, progressRef, handleResultRef]);
};

interface UsePreviewImageArgs {
  image: string;
  compact: boolean;
  lanesRef: React.MutableRefObject<PreviewLanes | null>;
  progressRef: React.MutableRefObject<ProgressiveState>;
  bitmapSentRef: React.MutableRefObject<boolean>;
  compactSourceRef: React.MutableRefObject<CompactSource | null>;
  imgCacheRef: React.MutableRefObject<{ src: string; el: HTMLImageElement } | null>;
  scheduleProcessRef: React.MutableRefObject<() => void>;
}

const postImageToLanes = (lanes: PreviewLanes, bitmap: ImageBitmap, draftBitmap: ImageBitmap, progress: ProgressiveState): void => {
  resetForNewImage(progress, bitmap.width, bitmap.height);
  lanes.draft.worker.postMessage({ type: "setImage", bitmap: draftBitmap }, [draftBitmap]);
  lanes.full.worker.postMessage({ type: "setImage", bitmap }, [bitmap]);
};

export const usePreviewImage = ({
  image, compact, lanesRef, progressRef, bitmapSentRef, compactSourceRef, imgCacheRef, scheduleProcessRef,
}: UsePreviewImageArgs): void => {
  useEffect(() => {
    if (!image) return;
    bitmapSentRef.current = false;
    compactSourceRef.current = null;

    let cancelled = false;

    const runCompact = async (): Promise<void> => {
      try {
        const source = await loadCompactSource(image);
        if (cancelled) return;
        compactSourceRef.current = source;
        scheduleProcessRef.current();
      } catch (err) {
        console.error("compact preview source failed:", err);
      }
    };

    const run = async (): Promise<void> => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;

      try {
        const lanes = lanesRef.current;
        if (lanes && !compact) {
          const res = await fetch(image);
          const blob = await res.blob();
          if (cancelled) return;
          const bitmap = await createImageBitmap(blob);
          if (cancelled) {
            bitmap.close();
            return;
          }
          const draftBitmap = await createDraftBitmap(bitmap);
          if (cancelled) {
            bitmap.close();
            draftBitmap.close();
            return;
          }
          postImageToLanes(lanes, bitmap, draftBitmap, progressRef.current);
          bitmapSentRef.current = true;
          scheduleProcessRef.current();
        }

        await img.decode().catch(() => {});
        if (cancelled) return;
        imgCacheRef.current = { src: image, el: img };
        if (!bitmapSentRef.current) scheduleProcessRef.current();
      } catch (err) {
        console.error("preview image setup failed:", err);
        previewLoadingSignal.value = false;
      }
    };

    if (compact && supportsWorker) runCompact();
    else run();
    return () => {
      cancelled = true;
    };
  }, [image, compact, lanesRef, progressRef, bitmapSentRef, compactSourceRef, imgCacheRef, scheduleProcessRef]);
};
