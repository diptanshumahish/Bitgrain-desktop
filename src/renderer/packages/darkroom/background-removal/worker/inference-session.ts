import * as ort from "onnxruntime-web";
import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm?url";
import { MODEL_INPUT_SIZE } from "@bitgrain/engine/background/model-config";
import type { RemovalBackend } from "../removal-types";

ort.env.wasm.wasmPaths = { wasm: wasmUrl };

const INPUT_SHAPE = [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE];

interface GpuAdapterSource {
  requestAdapter: () => Promise<unknown>;
}

interface NavigatorWithGpu {
  gpu?: GpuAdapterSource;
}

export interface LoadedSession {
  session: ort.InferenceSession;
  backend: RemovalBackend;
}

const hasWebGpuAdapter = async (): Promise<boolean> => {
  const gpu = (navigator as NavigatorWithGpu).gpu;
  if (!gpu) return false;
  try {
    return (await gpu.requestAdapter()) !== null;
  } catch (error) {
    console.warn("WebGPU adapter is not available, using WebAssembly", error);
    return false;
  }
};

const createOn = async (model: Uint8Array, backend: RemovalBackend): Promise<LoadedSession> => ({
  session: await ort.InferenceSession.create(model, { executionProviders: [backend] }),
  backend,
});

export const createSession = async (model: Uint8Array, preferGpu: boolean): Promise<LoadedSession> => {
  if (preferGpu && (await hasWebGpuAdapter())) {
    try {
      return await createOn(model, "webgpu");
    } catch (error) {
      console.warn("WebGPU session failed, using WebAssembly", error);
    }
  }
  return createOn(model, "wasm");
};

export const runMask = async (loaded: LoadedSession, tensorData: Float32Array): Promise<Float32Array> => {
  const { session } = loaded;
  const input = new ort.Tensor("float32", tensorData, INPUT_SHAPE);
  const outputs = await session.run({ [session.inputNames[0]]: input });
  const data = outputs[session.outputNames[0]].data;
  if (!(data instanceof Float32Array)) throw new Error("Unexpected mask output from the model");
  return data;
};
