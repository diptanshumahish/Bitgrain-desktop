import { runTransform } from "../engine/engine";
import type { TransformMode } from "../engine/types";
import { buildTransformContext } from "./bitgrain-effect-core";
import type { BitgrainEffect } from "../data/studioTypes";

interface RequestMessage {
  id: number;
  bytes: ArrayBuffer;
  width: number;
  height: number;
  effect: BitgrainEffect;
}

interface ResponseMessage {
  id: number;
  bytes?: ArrayBuffer;
  width: number;
  height: number;
  error?: string;
}

self.addEventListener("message", (event: MessageEvent<RequestMessage>) => {
  const { id, bytes, width, height, effect } = event.data;
  try {
    const input = new Uint8ClampedArray(bytes);
    const data = new Float32Array(input.length);
    for (let i = 0; i < input.length; i += 1) data[i] = input[i];

    const ctx = buildTransformContext(data, width, height, effect);
    const result = runTransform(effect.kind as TransformMode, ctx);
    const out = result.colorData ?? new Uint8ClampedArray(width * height * 4);
    const buffer = out.buffer as ArrayBuffer;

    const response: ResponseMessage = { id, bytes: buffer, width, height };
    (self as unknown as Worker).postMessage(response, [buffer]);
  } catch (err) {
    const response: ResponseMessage = {
      id,
      width,
      height,
      error: err instanceof Error ? err.message : "transform failed",
    };
    (self as unknown as Worker).postMessage(response);
  }
});
