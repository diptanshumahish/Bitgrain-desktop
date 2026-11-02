import { INDETERMINATE_PROGRESS, type RemovalPhase } from "../removal-types";
import { createSession, runMask, type LoadedSession } from "./inference-session";
import { loadModelBytes } from "@bitgrain/engine/background/model-download";

type PhaseHandler = (phase: RemovalPhase, value: number) => void;

const state: { model: Uint8Array | null; loading: Promise<LoadedSession> | null } = { model: null, loading: null };

const loadSession = async (onPhase: PhaseHandler): Promise<LoadedSession> => {
  const model = state.model ?? (await loadModelBytes((value) => onPhase("downloading", value)));
  state.model = model;
  onPhase("preparing", INDETERMINATE_PROGRESS);
  return createSession(model, true);
};

export const ensureSession = async (onPhase: PhaseHandler): Promise<LoadedSession> => {
  state.loading ??= loadSession(onPhase);
  try {
    return await state.loading;
  } catch (error) {
    state.loading = null;
    throw error;
  }
};

const fallBackToWasm = async (): Promise<LoadedSession> => {
  if (!state.model) throw new Error("Background model is not loaded");
  state.loading = createSession(state.model, false);
  return state.loading;
};

export const runWithFallback = async (loaded: LoadedSession, tensorData: Float32Array): Promise<{ mask: Float32Array; loaded: LoadedSession }> => {
  try {
    return { mask: await runMask(loaded, tensorData), loaded };
  } catch (error) {
    if (loaded.backend !== "webgpu") throw error;
    console.warn("WebGPU run failed, retrying with WebAssembly", error);
    const fallback = await fallBackToWasm();
    return { mask: await runMask(fallback, tensorData), loaded: fallback };
  }
};
