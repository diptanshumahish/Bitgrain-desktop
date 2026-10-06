import { runTransform } from "../../../../engine/engine";
import type { TransformMode } from "../../../../engine/types";
import type { EffectParams } from "../../types";
import { buildTransformContext } from "../build-transform-context";
import { charGridFor, lastCharMode, renderCharFrame } from "../char-raster";

function processCharFrame(
  bytes: Uint8ClampedArray<ArrayBuffer>,
  width: number,
  height: number,
  charMode: TransformMode,
  modes: TransformMode[],
  params: Partial<EffectParams>,
  seeds: { frameSeed: number; popartFrameSeed: number; halftoneFrameSeed: number },
): { buffer: ArrayBuffer; width: number; height: number } {
  const grid = charGridFor(charMode, width, height, params.asciiDensity ?? 1);
  const sampler = new OffscreenCanvas(grid.cols, grid.rows);
  const sctx = sampler.getContext("2d");
  if (!sctx) throw new Error("sampler context unavailable");
  const sourceCanvas = new OffscreenCanvas(width, height);
  const sourceCtx = sourceCanvas.getContext("2d");
  if (!sourceCtx) throw new Error("source context unavailable");
  sourceCtx.putImageData(new ImageData(bytes, width, height), 0, 0);
  sctx.drawImage(sourceCanvas, 0, 0, grid.cols, grid.rows);
  const pixels = new Float32Array(sctx.getImageData(0, 0, grid.cols, grid.rows).data);
  const raster = renderCharFrame(pixels, grid, charMode, modes, params, seeds);
  const out = new Uint8ClampedArray(raster.data);
  return { buffer: out.buffer, width: raster.width, height: raster.height };
}

interface ProcessRequest {
  id: number;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  modes: TransformMode[];
  params: Partial<EffectParams>;
  frameSeed?: number;
  popartFrameSeed?: number;
  halftoneFrameSeed?: number;
}

interface ProcessResponse {
  id: number;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  error?: string;
}

self.onmessage = (event: MessageEvent<ProcessRequest>) => {
  const { id, buffer, width, height, modes, params, frameSeed, popartFrameSeed, halftoneFrameSeed } = event.data;
  const seed = frameSeed ?? 0;
  const popartSeed = popartFrameSeed ?? seed;
  const halftoneSeed = halftoneFrameSeed ?? seed;
  const seeds = {
    frameSeed: seed,
    popartFrameSeed: popartSeed,
    halftoneFrameSeed: halftoneSeed,
  };
  try {
    const bytes = new Uint8ClampedArray(buffer);

    const charMode = lastCharMode(modes);
    if (charMode) {
      const out = processCharFrame(bytes, width, height, charMode, modes, params, seeds);
      const response: ProcessResponse = {
        id,
        buffer: out.buffer as ArrayBuffer,
        width: out.width,
        height: out.height,
      };
      (self as unknown as Worker).postMessage(response, [out.buffer as ArrayBuffer]);
      return;
    }

    const floats = new Float32Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) floats[i] = bytes[i];

    if (modes.length === 0) {
      // A chain of nothing but `transform` effects still has to deliver the
      // colour adjustments the inspector applied. `runTransform([])` cannot: with
      // no plugin in the chain it returns its zero-filled scratch buffer, i.e. a
      // black frame. Route through the LUT plugin with no LUT selected instead,
      // the engine's one identity pass, which returns the preprocessed pixels
      // untouched. `lutId` is forced off so a LUT parameter left on the clip
      // cannot sneak into a chain that never asked for it.
      const identityCtx = buildTransformContext(floats, width, height, params, seeds);
      identityCtx.lutId = undefined;
      const result = runTransform(["lut"], identityCtx);
      const out = result.colorData ?? bytes;
      const outBuf = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
      const response: ProcessResponse = { id, buffer: outBuf as ArrayBuffer, width, height };
      (self as unknown as Worker).postMessage(response, [outBuf as ArrayBuffer]);
      return;
    }

    const result = runTransform(modes, buildTransformContext(floats, width, height, params, seeds));
    if (!result.colorData) {
      const response: ProcessResponse = { id, buffer, width, height };
      (self as unknown as Worker).postMessage(response, [buffer]);
      return;
    }

    const outW = result.gridWidth ?? width;
    const outH = result.gridHeight ?? height;
    const outBytes = new Uint8ClampedArray(result.colorData.length);
    outBytes.set(result.colorData);
    const outBuf = outBytes.buffer;
    const response: ProcessResponse = { id, buffer: outBuf, width: outW, height: outH };
    (self as unknown as Worker).postMessage(response, [outBuf]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const response: ProcessResponse = {
      id,
      buffer: new ArrayBuffer(0),
      width,
      height,
      error: message,
    };
    (self as unknown as Worker).postMessage(response);
  }
};
