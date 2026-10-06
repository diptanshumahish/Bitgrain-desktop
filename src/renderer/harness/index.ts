import { runTransform } from "../engine/engine";
import { encodePng } from "../engine/export/encode-image";
import { buildTransformContext } from "../utils/bitgrain-effect-core";
import {
  runBandedInProcess,
  type BandTransformSpec,
} from "../engine/parallel/band-runner";
import { runBandedPooled } from "../engine/parallel/band-pool";
import type { BitgrainEffect } from "../data/studioTypes";
import type { TransformMode } from "../engine/types";

interface RenderRequest {
  imageUrl: string;
  effect: BitgrainEffect;
  lossless: boolean;
}

interface RenderResult {
  width: number;
  height: number;
  pngBytes: Uint8Array;
  checksum: number;
}

const toFloatData = (pixels: Uint8ClampedArray): Float32Array => {
  const data = new Float32Array(pixels.length);
  for (let index = 0; index < pixels.length; index += 1) data[index] = pixels[index];
  return data;
};

const toClampedData = (data: Float32Array): Uint8ClampedArray => {
  const pixels = new Uint8ClampedArray(data.length);
  for (let index = 0; index < data.length; index += 1) pixels[index] = data[index];
  return pixels;
};

const checksumOf = (bytes: ArrayLike<number>): number => {
  let hash = 2166136261;
  for (let index = 0; index < bytes.length; index += 1) {
    hash ^= bytes[index];
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const decodeImage = async (imageUrl: string): Promise<ImageData> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("no 2d context");
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
};

const render = async ({ imageUrl, effect, lossless }: RenderRequest): Promise<RenderResult> => {
  const source = await decodeImage(imageUrl);
  const context = buildTransformContext(
    toFloatData(source.data),
    source.width,
    source.height,
    effect,
  );

  const result = runTransform(effect.kind as never, context);
  const workingData = result.workingData ?? context.data;
  const pixels = result.colorData ?? toClampedData(workingData);
  const pngBytes = encodePng(pixels, source.width, source.height, 1, lossless);

  return {
    width: source.width,
    height: source.height,
    pngBytes,
    checksum: checksumOf(pngBytes),
  };
};

interface BandBenchRequest {
  imageUrl: string;
  modes: TransformMode[];
  spec?: Partial<BandTransformSpec>;
  tileTo?: number;
}

interface BandBenchResult {
  width: number;
  height: number;
  serialChecksum: number;
  inProcessChecksum: number;
  pooledChecksum: number;
  serialMs: number;
  inProcessMs: number;
  pooledMs: number;
  bandIdentical: boolean;
  pooledIdentical: boolean;
}

const NEUTRAL_SPEC: BandTransformSpec = {
  modes: [],
  contrast: 1,
  brightness: 1,
  saturation: 1,
  isColor: true,
};

// Tiles the source into a larger buffer so the benchmark runs at a realistic
// export resolution rather than the small sample size. Pure per-pixel effects
// are unaffected by the tiling, the point is only to give the cores real work.
const tilePixels = (
  source: ImageData,
  target: number,
): { pixels: Float32Array; width: number; height: number } => {
  const repeat = Math.max(1, Math.ceil(target / source.width));
  const width = source.width * repeat;
  const height = source.height * repeat;
  const pixels = new Float32Array(width * height * 4);
  for (let ty = 0; ty < height; ty += 1) {
    const sy = ty % source.height;
    for (let tx = 0; tx < width; tx += 1) {
      const sx = tx % source.width;
      const si = (sy * source.width + sx) * 4;
      const ti = (ty * width + tx) * 4;
      pixels[ti] = source.data[si];
      pixels[ti + 1] = source.data[si + 1];
      pixels[ti + 2] = source.data[si + 2];
      pixels[ti + 3] = source.data[si + 3];
    }
  }
  return { pixels, width, height };
};

const benchmarkBands = async (request: BandBenchRequest): Promise<BandBenchResult> => {
  const source = await decodeImage(request.imageUrl);
  const { pixels, width, height } = tilePixels(source, request.tileTo ?? source.width);
  const spec: BandTransformSpec = {
    ...NEUTRAL_SPEC,
    ...request.spec,
    modes: request.modes,
  };

  const serialStart = performance.now();
  const serial = runTransform(spec.modes, {
    ...spec,
    data: pixels.slice(),
    width,
    height,
  });
  const serialMs = performance.now() - serialStart;
  const serialChecksum = checksumOf(serial.colorData!);

  const cores = navigator.hardwareConcurrency ?? 4;
  const inStart = performance.now();
  const inProcess = runBandedInProcess(pixels.slice(), width, height, spec, cores - 1);
  const inProcessMs = performance.now() - inStart;
  const inProcessChecksum = checksumOf(inProcess);

  const pooledStart = performance.now();
  const pooled = await runBandedPooled(pixels.slice(), width, height, spec);
  const pooledMs = performance.now() - pooledStart;
  const pooledChecksum = checksumOf(pooled);

  return {
    width,
    height,
    serialChecksum,
    inProcessChecksum,
    pooledChecksum,
    serialMs,
    inProcessMs,
    pooledMs,
    bandIdentical: serialChecksum === inProcessChecksum,
    pooledIdentical: serialChecksum === pooledChecksum,
  };
};

const scaleViaOffscreen = async (
  imageUrl: string,
  cols: number,
  rows: number,
): Promise<number> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(cols, rows);
  const context = canvas.getContext("2d")!;
  context.drawImage(bitmap, 0, 0, cols, rows);
  return checksumOf(context.getImageData(0, 0, cols, rows).data);
};

// The banded export and the transform worker both downscale with OffscreenCanvas.
// This confirms that path is deterministic run to run, which is what makes a
// banded export byte-identical to a single-worker export of the same settings.
const scalingParity = async (
  imageUrl: string,
  cols: number,
  rows: number,
): Promise<{ firstChecksum: number; secondChecksum: number; identical: boolean }> => {
  const firstChecksum = await scaleViaOffscreen(imageUrl, cols, rows);
  const secondChecksum = await scaleViaOffscreen(imageUrl, cols, rows);
  return { firstChecksum, secondChecksum, identical: firstChecksum === secondChecksum };
};

declare global {
  interface Window {
    __bitgrainHarness?: {
      render(request: RenderRequest): Promise<RenderResult>;
      benchmarkBands(request: BandBenchRequest): Promise<BandBenchResult>;
      scalingParity(
        imageUrl: string,
        cols: number,
        rows: number,
      ): Promise<{ firstChecksum: number; secondChecksum: number; identical: boolean }>;
    };
  }
}

window.__bitgrainHarness = { render, benchmarkBands, scalingParity };
