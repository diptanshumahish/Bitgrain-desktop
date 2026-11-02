export const spawnTransformWorker = (): Worker =>
  new Worker(new URL("./transform.worker.ts", import.meta.url), { type: "module" });
