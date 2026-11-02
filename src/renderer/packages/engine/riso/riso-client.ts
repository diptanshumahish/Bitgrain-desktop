export interface RisoResult {
  width: number;
  height: number;
  preview: ImageData;
  layers: ImageData[];
}

interface WorkerResponse {
  id: number;
  width: number;
  height: number;
  preview: ArrayBuffer;
  layers: ArrayBuffer[];
}

interface PendingRequest {
  resolve: (result: RisoResult) => void;
  reject: (reason: unknown) => void;
  timeoutHandle: ReturnType<typeof setTimeout>;
}

const RISO_REQUEST_TIMEOUT_MS = 60_000;

let worker: Worker | null = null;
let nextRequestId = 0;
const pending = new Map<number, PendingRequest>();

const drainPending = (reason: unknown): void => {
  for (const [, entry] of pending) {
    clearTimeout(entry.timeoutHandle);
    entry.reject(reason);
  }
  pending.clear();
};

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./riso.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, width, height, preview, layers } = event.data;
    const entry = pending.get(id);
    if (!entry) return;
    clearTimeout(entry.timeoutHandle);
    pending.delete(id);
    entry.resolve({
      width,
      height,
      preview: new ImageData(new Uint8ClampedArray(preview), width, height),
      layers: layers.map(
        (buffer) => new ImageData(new Uint8ClampedArray(buffer), width, height),
      ),
    });
  };
  worker.onerror = (event) => {
    console.error("riso worker crashed:", event.message);
    drainPending(new Error("riso worker crashed"));
    worker = null;
  };
  worker.onmessageerror = () => {
    drainPending(new Error("riso worker message decode failed"));
  };
  return worker;
}

export function separateRiso(
  imageData: ImageData,
  inks: number[][],
): Promise<RisoResult> {
  const activeWorker = getWorker();
  const id = nextRequestId;
  nextRequestId += 1;
  const buffer = imageData.data.buffer;
  return new Promise<RisoResult>((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      const entry = pending.get(id);
      if (!entry) return;
      pending.delete(id);
      entry.reject(new Error("riso worker request timed out after 60s"));
    }, RISO_REQUEST_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timeoutHandle });
    activeWorker.postMessage(
      { id, buffer, width: imageData.width, height: imageData.height, inks },
      [buffer],
    );
  });
}
