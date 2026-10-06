import type { BitgrainEffect } from "../data/studioTypes";
import { buildTransformContext } from "./bitgrain-effect-core";

interface PendingRequest {
  resolve: (bytes: Uint8ClampedArray) => void;
  reject: (reason: unknown) => void;
  timeoutHandle: ReturnType<typeof setTimeout>;
}

interface WorkerResponse {
  id: number;
  bytes?: ArrayBuffer;
  width: number;
  height: number;
  error?: string;
}

const WORKER_REQUEST_TIMEOUT_MS = 30_000;

let worker: Worker | null = null;
let workerUnavailable = false;
let nextRequestId = 1;
const pending = new Map<number, PendingRequest>();

const settlePending = (id: number, settle: (entry: PendingRequest) => void): void => {
  const entry = pending.get(id);
  if (!entry) return;
  clearTimeout(entry.timeoutHandle);
  pending.delete(id);
  settle(entry);
};

const getWorker = (): Worker | null => {
  if (workerUnavailable) return null;
  if (worker) return worker;
  try {
    worker = new Worker(
      new URL("./bitgrain-effect.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      const { id, bytes, error } = event.data;
      settlePending(id, (entry) => {
        if (error || !bytes) {
          entry.reject(new Error(error ?? "worker returned no data"));
          return;
        }
        entry.resolve(new Uint8ClampedArray(bytes));
      });
    });
    worker.addEventListener("error", () => {
      workerUnavailable = true;
      for (const [, entry] of pending) {
        clearTimeout(entry.timeoutHandle);
        entry.reject(new Error("worker crashed"));
      }
      pending.clear();
      worker = null;
    });
    return worker;
  } catch {
    workerUnavailable = true;
    return null;
  }
};

const runOnMainThread = async (
  bytes: Uint8ClampedArray,
  width: number,
  height: number,
  effect: BitgrainEffect,
): Promise<Uint8ClampedArray> => {
  const { runTransform } = await import("../engine/engine");
  const data = new Float32Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) data[i] = bytes[i];
  const ctx = buildTransformContext(data, width, height, effect);
  const result = runTransform(effect.kind, ctx);
  return result.colorData ?? new Uint8ClampedArray(width * height * 4);
};

export const runBitgrainTransform = (
  bytes: Uint8ClampedArray,
  width: number,
  height: number,
  effect: BitgrainEffect,
): Promise<Uint8ClampedArray> => {
  const activeWorker = getWorker();
  if (!activeWorker) return runOnMainThread(bytes, width, height, effect);

  return new Promise<Uint8ClampedArray>((resolve, reject) => {
    const id = nextRequestId++;
    const timeoutHandle = setTimeout(() => {
      settlePending(id, (entry) =>
        entry.reject(new Error("bitgrain worker request timed out after 30s")),
      );
    }, WORKER_REQUEST_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timeoutHandle });
    const copy = new Uint8ClampedArray(bytes);
    const buffer = copy.buffer as ArrayBuffer;
    activeWorker.postMessage(
      { id, bytes: buffer, width, height, effect },
      [buffer],
    );
  }).catch((err) => {
    if (workerUnavailable) return runOnMainThread(bytes, width, height, effect);
    throw err;
  });
};
