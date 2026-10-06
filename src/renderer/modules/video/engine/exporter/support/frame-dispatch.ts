import { isIdentityChain, type CaptureResult, type LayerCapture } from "../frame-capture";
import type { ComposedLayer } from "../frame-compose";
import type { FrameWorkerPool, ProcessResult } from "../worker-pool";

function processLayer(pool: FrameWorkerPool, layer: LayerCapture): Promise<ProcessResult | null> {
  // Desktop: skip only a chain that provably changes nothing (see isIdentityChain);
  // web skips on "no effects at all", which is the same set minus neutral grades.
  if (isIdentityChain(layer.modes, layer.params)) {
    return Promise.resolve<ProcessResult | null>({
      buffer: layer.rawBuffer,
      width: layer.processingWidth,
      height: layer.processingHeight,
    });
  }
  return pool.process({
    buffer: layer.rawBuffer,
    width: layer.processingWidth,
    height: layer.processingHeight,
    modes: layer.modes,
    params: layer.params,
    ...layer.seeds,
  });
}

export function dispatchCapture(
  pool: FrameWorkerPool,
  capture: CaptureResult,
): Promise<ProcessResult | null>[] {
  return capture.layers.map((layer) => processLayer(pool, layer));
}

export function toComposedLayers(
  capture: CaptureResult,
  results: (ProcessResult | null)[],
): ComposedLayer[] {
  return capture.layers.map((layer, index) => {
    const result = results[index];
    return {
      capture: layer,
      buffer: result?.buffer ?? null,
      width: result?.width ?? 0,
      height: result?.height ?? 0,
    };
  });
}
