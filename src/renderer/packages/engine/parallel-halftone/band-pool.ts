import type { RowRange, ScreenPlan } from "../plugins/halftone/screen-types";
import type { BandReply, BandRequest } from "./band-messages";

const MAX_HELPERS = 3;
const RESERVED_CORES = 2;

interface PendingBand {
  worker: Worker;
  resolve: (band: Uint8ClampedArray) => void;
  reject: (reason: Error) => void;
}

const helpers: Worker[] = [];
const pendingBands = new Map<number, PendingBand>();
let nextRequestId = 0;

export const helperCount = (): number => {
  if (typeof Worker === "undefined") return 0;
  const cores = navigator.hardwareConcurrency || 1;
  return Math.min(MAX_HELPERS, Math.max(0, cores - RESERVED_CORES));
};

const rejectPendingFor = (worker: Worker, reason: string): void => {
  for (const [id, pending] of pendingBands) {
    if (pending.worker !== worker) continue;
    pendingBands.delete(id);
    pending.reject(new Error(reason));
  }
};

const settleBand = (event: MessageEvent<BandReply>): void => {
  const pending = pendingBands.get(event.data.id);
  if (!pending) return;
  pendingBands.delete(event.data.id);
  pending.resolve(event.data.band);
};

const spawnHelper = (): Worker => {
  const worker = new Worker(new URL("./halftone-band.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = settleBand;
  worker.onerror = (event) => rejectPendingFor(worker, event.message || "halftone band worker failed");
  worker.onmessageerror = () => rejectPendingFor(worker, "halftone band message failed");
  return worker;
};

const helperAt = (index: number): Worker => {
  while (helpers.length <= index) helpers.push(spawnHelper());
  return helpers[index];
};

export const requestBand = (helperIndex: number, plan: ScreenPlan, rows: RowRange): Promise<Uint8ClampedArray> =>
  new Promise((resolve, reject) => {
    const worker = helperAt(helperIndex);
    nextRequestId += 1;
    const request: BandRequest = { id: nextRequestId, plan, rows };
    pendingBands.set(request.id, { worker, resolve, reject });
    worker.postMessage(request);
  });
