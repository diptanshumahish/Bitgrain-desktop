import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { cpus } from "node:os";
import { fileURLToPath } from "node:url";

// Measures the multi-core headroom available to the effects engine on this
// machine. It runs one representative per-pixel workload (a posterize + gamma
// pass over a 4K RGBA buffer, repeated) single-threaded, then partitioned by
// row bands across all cores using SharedArrayBuffer, and confirms the two
// outputs are byte-identical. Byte-identical is the whole point: it proves the
// parallel path can accelerate export without breaking output determinism.

const WIDTH = 3840;
const HEIGHT = 2160;
const CHANNELS = 4;
const PASSES = 8;
const LEVELS = 6;

const totalBytes = WIDTH * HEIGHT * CHANNELS;

function processBand(view, startRow, endRow) {
  const step = 255 / (LEVELS - 1);
  for (let pass = 0; pass < PASSES; pass += 1) {
    for (let row = startRow; row < endRow; row += 1) {
      let index = row * WIDTH * CHANNELS;
      for (let column = 0; column < WIDTH; column += 1) {
        for (let channel = 0; channel < 3; channel += 1) {
          const value = view[index + channel];
          const gamma = Math.pow(value / 255, 0.9) * 255;
          view[index + channel] = Math.round(Math.round(gamma / step) * step);
        }
        index += CHANNELS;
      }
    }
  }
}

function fillDeterministic(view) {
  let seed = 0x9e3779b9;
  for (let i = 0; i < view.length; i += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    view[i] = seed & 0xff;
  }
}

function checksum(view) {
  let hash = 2166136261;
  for (let i = 0; i < view.length; i += 1) {
    hash ^= view[i];
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

if (!isMainThread) {
  const view = new Uint8ClampedArray(workerData.buffer);
  processBand(view, workerData.startRow, workerData.endRow);
  parentPort.postMessage("done");
} else {
  const run = async () => {
    const cores = cpus().length;
    const workerCount = Math.max(1, cores - 1);

    const singleBuffer = new SharedArrayBuffer(totalBytes);
    const singleView = new Uint8ClampedArray(singleBuffer);
    fillDeterministic(singleView);

    const singleStart = performance.now();
    processBand(singleView, 0, HEIGHT);
    const singleMs = performance.now() - singleStart;
    const singleSum = checksum(singleView);

    const parallelBuffer = new SharedArrayBuffer(totalBytes);
    const parallelView = new Uint8ClampedArray(parallelBuffer);
    fillDeterministic(parallelView);

    const rowsPerWorker = Math.ceil(HEIGHT / workerCount);
    const selfPath = fileURLToPath(import.meta.url);

    const parallelStart = performance.now();
    const jobs = [];
    for (let w = 0; w < workerCount; w += 1) {
      const startRow = w * rowsPerWorker;
      const endRow = Math.min(HEIGHT, startRow + rowsPerWorker);
      if (startRow >= endRow) break;
      jobs.push(
        new Promise((resolve, reject) => {
          const worker = new Worker(selfPath, {
            workerData: { buffer: parallelBuffer, startRow, endRow },
          });
          worker.on("message", () => worker.terminate().then(resolve, resolve));
          worker.on("error", reject);
        }),
      );
    }
    await Promise.all(jobs);
    const parallelMs = performance.now() - parallelStart;
    const parallelSum = checksum(parallelView);

    const identical = singleSum === parallelSum;
    const speedup = singleMs / parallelMs;
    const mpix = (WIDTH * HEIGHT * PASSES) / 1_000_000;

    console.log(`  device            ${cpus()[0].model}`);
    console.log(`  cores             ${cores} logical, ${workerCount} workers`);
    console.log(`  workload          ${WIDTH}x${HEIGHT} RGBA, ${PASSES} passes (${mpix.toFixed(0)} Mpix)`);
    console.log(`  single-threaded   ${singleMs.toFixed(0)} ms`);
    console.log(`  multi-core        ${parallelMs.toFixed(0)} ms`);
    console.log(`  speedup           ${speedup.toFixed(2)}x`);
    console.log(`  byte-identical    ${identical ? "yes" : "NO — determinism broken"}`);

    if (!identical) {
      console.error("PARALLEL OUTPUT DIVERGED, this path is unsafe for export");
      process.exit(1);
    }
    console.log(`\nHeadroom: multi-core is ${speedup.toFixed(1)}x faster with identical output.`);
  };

  void run();
}
