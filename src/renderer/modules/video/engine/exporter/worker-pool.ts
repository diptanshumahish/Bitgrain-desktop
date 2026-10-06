import FrameProcessorWorker from "./frame-processor.worker?worker";
import type { TransformMode } from "../../../../engine/types";
import type { EffectParams } from "../../types";

const MIN_WORKERS = 2;
const MAX_WORKERS = 8;

export interface ProcessJob {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  modes: TransformMode[];
  params: Partial<EffectParams>;
  frameSeed?: number;
  popartFrameSeed?: number;
  halftoneFrameSeed?: number;
}

export interface ProcessResult {
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

interface PendingJob {
  id: number;
  resolve: (value: ProcessResult) => void;
  reject: (reason: Error) => void;
}

interface InternalWorker {
  worker: Worker;
  pending: Map<number, PendingJob>;
}

function detectWorkerCount(): number {
  const hw = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 4;
  const target = Math.floor((hw || 4) - 1);
  return Math.max(MIN_WORKERS, Math.min(MAX_WORKERS, target));
}

export class FrameWorkerPool {
  private workers: InternalWorker[] = [];
  private nextWorker = 0;
  private nextJobId = 1;
  private terminated = false;

  constructor(size: number = detectWorkerCount()) {
    for (let i = 0; i < size; i++) {
      const worker = new FrameProcessorWorker();
      const internal: InternalWorker = { worker, pending: new Map() };
      worker.onmessage = (event) => this.handleMessage(internal, event);
      worker.onerror = (event) => this.handleError(internal, event.message);
      this.workers.push(internal);
    }
  }

  get size(): number {
    return this.workers.length;
  }

  process(job: ProcessJob): Promise<ProcessResult> {
    if (this.terminated) {
      return Promise.reject(new Error("worker pool terminated"));
    }
    const id = this.nextJobId++;
    const target = this.workers[this.nextWorker];
    this.nextWorker = (this.nextWorker + 1) % this.workers.length;

    return new Promise<ProcessResult>((resolve, reject) => {
      target.pending.set(id, { id, resolve, reject });
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
    for (const w of this.workers) {
      const err = new Error("worker pool terminated");
      for (const pending of w.pending.values()) pending.reject(err);
      w.pending.clear();
      w.worker.terminate();
    }
    this.workers = [];
  }

  private handleMessage(
    internal: InternalWorker,
    event: MessageEvent<{
      id: number;
      buffer: ArrayBuffer;
      width: number;
      height: number;
      error?: string;
    }>,
  ): void {
    const { id, buffer, width, height, error } = event.data;
    const pending = internal.pending.get(id);
    if (!pending) return;
    internal.pending.delete(id);
    if (error) {
      pending.reject(new Error(error));
      return;
    }
    pending.resolve({ buffer, width, height });
  }

  private handleError(internal: InternalWorker, message: string): void {
    const err = new Error(`worker error: ${message}`);
    for (const pending of internal.pending.values()) pending.reject(err);
    internal.pending.clear();
  }
}
