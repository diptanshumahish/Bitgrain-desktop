import "../../../../shell/workers/bundled-background-model";
import type { RemovalBackend, RemovalRequest, RemovalWorkerMessage } from "../removal-types";
import { INDETERMINATE_PROGRESS } from "../removal-types";
import { pixelsToTensorData } from "@bitgrain/engine/background/image-tensor";
import { maskToRgba } from "@bitgrain/engine/background/mask-alpha";
import { composeCutOut } from "./cut-out";
import { readModelPixels } from "@bitgrain/engine/background/model-pixels";
import { ensureSession, runWithFallback } from "./session-store";
import { classifyError } from "./classify-error";

interface CutOutResult {
  blob: Blob;
  backend: RemovalBackend;
}

const post = (message: RemovalWorkerMessage): void => {
  (self as unknown as Worker).postMessage(message);
};

const cutOut = async (id: number, bitmap: ImageBitmap): Promise<CutOutResult> => {
  const session = await ensureSession((phase, value) => post({ type: "progress", id, phase, value }));
  post({ type: "progress", id, phase: "removing", value: INDETERMINATE_PROGRESS });
  const { mask, loaded } = await runWithFallback(session, pixelsToTensorData(readModelPixels(bitmap)));
  const blob = await composeCutOut(bitmap, maskToRgba(mask));
  return { blob, backend: loaded.backend };
};

self.onmessage = async (event: MessageEvent<RemovalRequest>): Promise<void> => {
  const { id, bitmap } = event.data;
  try {
    post({ type: "done", id, ...(await cutOut(id, bitmap)) });
  } catch (error) {
    console.error("Background removal failed", error);
    post({ type: "error", id, code: classifyError(error), message: error instanceof Error ? error.message : String(error) });
  } finally {
    bitmap.close();
  }
};
