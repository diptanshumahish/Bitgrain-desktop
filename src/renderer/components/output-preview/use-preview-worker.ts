import { useEffect } from "react";
import { previewLoadingSignal } from "../../store/image-store";
import { supportsWorker } from "./render-helpers";
import type { WorkerResult } from "./types";

interface UsePreviewWorkerArgs {
  compact: boolean;
  workerRef: React.MutableRefObject<Worker | null>;
  bufCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  pendingRef: React.MutableRefObject<object | null>;
  processingRef: React.MutableRefObject<boolean>;
  renderWorkerResultRef: React.MutableRefObject<(result: WorkerResult) => void>;
  sendToWorkerRef: React.MutableRefObject<(params: object) => void>;
}

export const usePreviewWorker = ({
  compact, workerRef, bufCanvasRef, pendingRef, processingRef,
  renderWorkerResultRef, sendToWorkerRef,
}: UsePreviewWorkerArgs): void => {
  useEffect(() => {
    if (!supportsWorker || compact) return;

    let worker: Worker;
    try {
      worker = new Worker(
        new URL("../../engine/transform.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch {
      return;
    }

    workerRef.current = worker;
    bufCanvasRef.current = document.createElement("canvas");

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === "result") {
        renderWorkerResultRef.current(e.data);
        processingRef.current = false;

        if (pendingRef.current) {
          const params = pendingRef.current;
          pendingRef.current = null;
          sendToWorkerRef.current(params);
        }
      }
    };

    worker.onerror = (event) => {
      console.error("preview worker error:", event.message);
      processingRef.current = false;
      pendingRef.current = null;
      previewLoadingSignal.value = false;
    };

    worker.onmessageerror = () => {
      processingRef.current = false;
      pendingRef.current = null;
      previewLoadingSignal.value = false;
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [compact, workerRef, bufCanvasRef, pendingRef, processingRef, renderWorkerResultRef, sendToWorkerRef]);
};

interface UsePreviewImageArgs {
  image: string;
  compact: boolean;
  workerRef: React.MutableRefObject<Worker | null>;
  bitmapSentRef: React.MutableRefObject<boolean>;
  imgCacheRef: React.MutableRefObject<{ src: string; el: HTMLImageElement } | null>;
  scheduleProcessRef: React.MutableRefObject<() => void>;
}

export const usePreviewImage = ({
  image, compact, workerRef, bitmapSentRef, imgCacheRef, scheduleProcessRef,
}: UsePreviewImageArgs): void => {
  useEffect(() => {
    if (!image) return;
    bitmapSentRef.current = false;

    let cancelled = false;

    const run = async (): Promise<void> => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;

      try {
        if (workerRef.current && !compact) {
          const res = await fetch(image);
          const blob = await res.blob();
          if (cancelled) return;
          const bitmap = await createImageBitmap(blob);
          if (cancelled) {
            bitmap.close();
            return;
          }
          workerRef.current.postMessage({ type: "setImage", bitmap }, [bitmap]);
          bitmapSentRef.current = true;
        }

        await img.decode().catch(() => {});
        if (cancelled) return;
        imgCacheRef.current = { src: image, el: img };
        scheduleProcessRef.current();
      } catch (err) {
        console.error("preview image setup failed:", err);
        previewLoadingSignal.value = false;
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [image, compact, workerRef, bitmapSentRef, imgCacheRef, scheduleProcessRef]);
};
