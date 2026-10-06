import {
  planBands,
  sliceBand,
  stitchBand,
  runBandedInProcess,
  type BandTransformSpec,
} from "./band-runner";

const CHANNELS = 4;
const MAX_POOL = 12;
const RESERVED_CORES = 1;
// Below this the worker dispatch and buffer transfer cost more than the pixel
// work saved, so the pool stays single-threaded and there is no regression.
const MIN_PARALLEL_PIXELS = 1_000_000;

interface PendingJob {
  resolve: (color: Uint8ClampedArray) => void;
  reject: (error: unknown) => void;
}

const resolvePoolSize = (): number => {
  const cores = globalThis.navigator?.hardwareConcurrency ?? 4;
  return Math.max(1, Math.min(MAX_POOL, cores - RESERVED_CORES));
};

class BandPool {
  private workers: Worker[] = [];
  private nextJobId = 0;
  private pending = new Map<number, PendingJob>();

  private ensureWorkers(count: number): boolean {
    if (this.workers.length >= count) return true;
    try {
      while (this.workers.length < count) {
        const worker = new Worker(new URL("./band.worker.ts", import.meta.url), {
          type: "module",
        });
        worker.onmessage = (event: MessageEvent<{ id: number; color: ArrayBuffer }>) => {
          const job = this.pending.get(event.data.id);
          if (!job) return;
          this.pending.delete(event.data.id);
          job.resolve(new Uint8ClampedArray(event.data.color));
        };
        worker.onerror = (event) => this.failAll(event);
        this.workers.push(worker);
      }
      return true;
    } catch {
      return false;
    }
  }

  private failAll(error: unknown): void {
    for (const job of this.pending.values()) job.reject(error);
    this.pending.clear();
  }

  private dispatch(
    worker: Worker,
    pixels: Float32Array,
    cols: number,
    bandRows: number,
    spec: BandTransformSpec,
  ): Promise<Uint8ClampedArray> {
    const id = this.nextJobId++;
    const buffer = pixels.buffer as ArrayBuffer;
    return new Promise<Uint8ClampedArray>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      worker.postMessage({ id, pixels: buffer, cols, bandRows, spec }, [buffer]);
    });
  }

  async run(
    pixels: Float32Array,
    cols: number,
    rows: number,
    spec: BandTransformSpec,
  ): Promise<Uint8ClampedArray> {
    const poolSize = resolvePoolSize();
    const bands = planBands(rows, poolSize);

    const tooSmall = cols * rows < MIN_PARALLEL_PIXELS;
    if (tooSmall || bands.length <= 1 || !this.ensureWorkers(bands.length)) {
      return runBandedInProcess(pixels, cols, rows, spec, bands.length);
    }

    const output = new Uint8ClampedArray(cols * rows * CHANNELS);
    const jobs = bands.map((band, index) => {
      const bandPixels = sliceBand(pixels, cols, band);
      return this.dispatch(this.workers[index], bandPixels, cols, band.bandRows, spec).then(
        (bandColor) => stitchBand(output, bandColor, cols, band),
      );
    });

    await Promise.all(jobs);
    return output;
  }

  dispose(): void {
    for (const worker of this.workers) worker.terminate();
    this.workers = [];
    this.pending.clear();
  }
}

let sharedPool: BandPool | null = null;

export const getBandPool = (): BandPool => {
  if (!sharedPool) sharedPool = new BandPool();
  return sharedPool;
};

export const runBandedPooled = (
  pixels: Float32Array,
  cols: number,
  rows: number,
  spec: BandTransformSpec,
): Promise<Uint8ClampedArray> => getBandPool().run(pixels, cols, rows, spec);
