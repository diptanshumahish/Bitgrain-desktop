import FrameProcessorWorker from "../exporter/frame-processor.worker?worker";
import { signal } from "../../../../lib/signal";
import type { TransformMode } from "../../../../engine/types";
import type { EffectParams } from "../../types";

// The preview's own worker pool, separate from the exporter's. The exporter wants
// throughput and owns the machine for the length of an export; the preview wants
// latency and lives for the length of the session, so it keeps a warm pool sized
// to the box rather than spinning workers up per frame. Both drive the same
// `frame-processor.worker`, so a frame previewed and a frame exported run
// byte-identical engine code.

const MIN_WORKERS = 2;
// Leave two cores for the main thread (compositing, React) and the audio thread.
const RESERVED_CORES = 2;
const MAX_WORKERS = 16;

export interface PreviewJob {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  modes: TransformMode[];
  params: Partial<EffectParams>;
  frameSeed?: number;
  popartFrameSeed?: number;
  halftoneFrameSeed?: number;
}

export interface PreviewJobResult {
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

interface PendingJob {
  resolve: (value: PreviewJobResult) => void;
  reject: (reason: Error) => void;
}

interface PoolWorker {
  worker: Worker;
  pending: Map<number, PendingJob>;
}

// How many worker jobs are in flight right now, and how many workers exist. Both
// feed the preview's perf HUD, which is the only honest way to show that the app
// is actually using the machine.
export const poolBusySignal = signal(0);
export const poolSizeSignal = signal(0);

function detectWorkerCount(): number {
  const hw = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 4;
  const target = (hw || 4) - RESERVED_CORES;
  return Math.max(MIN_WORKERS, Math.min(MAX_WORKERS, target));
}

class PreviewPool {
  private workers: PoolWorker[] = [];
  private nextJobId = 1;
  private inFlight = 0;
  private terminated = false;

  constructor(size: number = detectWorkerCount()) {
    for (let i = 0; i < size; i++) {
      const worker = new FrameProcessorWorker();
      const entry: PoolWorker = { worker, pending: new Map() };
      worker.onmessage = (event) => this.handleMessage(entry, event);
      worker.onerror = (event) => this.handleError(entry, event.message);
      this.workers.push(entry);
    }
    poolSizeSignal.value = this.workers.length;
  }

  get size(): number {
    return this.workers.length;
  }

  get busy(): number {
    return this.inFlight;
  }

  // Dispatch to the least-loaded worker rather than round-robin. A preview frame
  // fans several layers out at once and they finish at wildly different speeds
  // (a dithered 4K layer against a plain image), so round-robin would queue a new
  // layer behind a slow one while another worker sits idle.
  process(job: PreviewJob): Promise<PreviewJobResult> {
    if (this.terminated || this.workers.length === 0) {
      return Promise.reject(new Error("preview pool terminated"));
    }
    const id = this.nextJobId++;
    let target = this.workers[0];
    for (const candidate of this.workers) {
      if (candidate.pending.size < target.pending.size) target = candidate;
    }

    this.inFlight++;
    poolBusySignal.value = this.inFlight;

    return new Promise<PreviewJobResult>((resolve, reject) => {
      target.pending.set(id, { resolve, reject });
      target.worker.postMessage(
        {
          id,
          buffer: job.buffer,
          width: job.width,
          height: job.height,
          modes: job.modes,
          params: job.params,
          frameSeed: job.frameSeed,
          popartFrameSeed: job.popartFrameSeed,
          halftoneFrameSeed: job.halftoneFrameSeed,
        },
        [job.buffer],
      );
    });
  }

  terminate(): void {
    this.terminated = true;
    for (const entry of this.workers) {
      const err = new Error("preview pool terminated");
      for (const pending of entry.pending.values()) pending.reject(err);
      entry.pending.clear();
      entry.worker.terminate();
    }
    this.workers = [];
    this.inFlight = 0;
    poolBusySignal.value = 0;
    poolSizeSignal.value = 0;
  }

  private settle(): void {
    this.inFlight = Math.max(0, this.inFlight - 1);
    poolBusySignal.value = this.inFlight;
  }

  private handleMessage(
    entry: PoolWorker,
    event: MessageEvent<{
      id: number;
      buffer: ArrayBuffer;
      width: number;
      height: number;
      error?: string;
    }>,
  ): void {
    const { id, buffer, width, height, error } = event.data;
    const pending = entry.pending.get(id);
    if (!pending) return;
    entry.pending.delete(id);
    this.settle();
    if (error) {
      pending.reject(new Error(error));
      return;
    }
    pending.resolve({ buffer, width, height });
  }

  private handleError(entry: PoolWorker, message: string): void {
    const err = new Error(`preview worker error: ${message}`);
    for (const pending of entry.pending.values()) {
      pending.reject(err);
      this.settle();
    }
    entry.pending.clear();
  }
}

let pool: PreviewPool | null = null;

export function getPreviewPool(): PreviewPool {
  if (!pool) pool = new PreviewPool();
  return pool;
}

export function releasePreviewPool(): void {
  pool?.terminate();
  pool = null;
}

export type { PreviewPool };
