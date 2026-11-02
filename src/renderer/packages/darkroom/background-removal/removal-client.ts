import { BackgroundRemovalError } from "@bitgrain/engine/background/removal-error";
import type { RemovalBackend, RemovalPhase, RemovalWorkerMessage } from "./removal-types";

type PhaseHandler = (phase: RemovalPhase, value: number) => void;

interface RemovalResult {
  blob: Blob;
  backend: RemovalBackend;
}

interface PendingRemoval {
  resolve: (result: RemovalResult) => void;
  reject: (reason: BackgroundRemovalError) => void;
  onPhase: PhaseHandler;
}

const pending = new Map<number, PendingRemoval>();
const workerRef: { current: Worker | null; nextId: number } = { current: null, nextId: 0 };

const settle = (message: RemovalWorkerMessage, entry: PendingRemoval): void => {
  if (message.type === "progress") {
    entry.onPhase(message.phase, message.value);
    return;
  }
  pending.delete(message.id);
  if (message.type === "done") entry.resolve({ blob: message.blob, backend: message.backend });
  else entry.reject(new BackgroundRemovalError(message.code, message.message));
};

const rejectAll = (message: string): void => {
  pending.forEach((entry) => entry.reject(new BackgroundRemovalError("unknown", message)));
  pending.clear();
};

const getWorker = (): Worker => {
  if (workerRef.current) return workerRef.current;
  const worker = new Worker(new URL("./worker/background-removal.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<RemovalWorkerMessage>) => {
    const entry = pending.get(event.data.id);
    if (entry) settle(event.data, entry);
  };
  worker.onerror = (event: ErrorEvent) => {
    console.error("Background removal worker crashed", event.message);
    workerRef.current = null;
    rejectAll(event.message || "Background removal worker crashed");
  };
  workerRef.current = worker;
  return worker;
};

export const requestBackgroundRemoval = (bitmap: ImageBitmap, onPhase: PhaseHandler): Promise<RemovalResult> =>
  new Promise((resolve, reject) => {
    workerRef.nextId += 1;
    const id = workerRef.nextId;
    pending.set(id, { resolve, reject, onPhase });
    getWorker().postMessage({ id, bitmap }, [bitmap]);
  });
