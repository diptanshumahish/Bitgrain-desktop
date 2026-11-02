import { MODEL_BYTES, MODEL_CACHE_NAME, MODEL_URL } from "./model-config";
import { BackgroundRemovalError } from "./removal-error";
import { isTrustedModel } from "./model-integrity";
import { readWithProgress } from "./verified-download";

type ProgressHandler = (value: number) => void;

const openModelCache = async (): Promise<Cache | null> => {
  if (typeof caches === "undefined") return null;
  try {
    return await caches.open(MODEL_CACHE_NAME);
  } catch (error) {
    console.warn("Background model cache is not available", error);
    return null;
  }
};

const readCachedModel = async (cache: Cache): Promise<Uint8Array<ArrayBuffer> | null> => {
  const response = await cache.match(MODEL_URL);
  if (!response) return null;
  const bytes = new Uint8Array(await response.arrayBuffer());
  return (await isTrustedModel(bytes)) ? bytes : null;
};

const downloadModel = async (onProgress: ProgressHandler): Promise<Uint8Array<ArrayBuffer>> => {
  try {
    const response = await fetch(MODEL_URL, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error(`Model download failed with status ${response.status}`);
    return await readWithProgress(response, MODEL_BYTES, onProgress);
  } catch (error) {
    throw new BackgroundRemovalError("network", error instanceof Error ? error.message : String(error));
  }
};

const keepModel = async (cache: Cache, bytes: Uint8Array<ArrayBuffer>): Promise<void> => {
  try {
    await cache.put(MODEL_URL, new Response(bytes, { headers: { "Content-Type": "application/octet-stream" } }));
  } catch (error) {
    console.warn("Could not keep the background model for next time", error);
  }
};

export const loadModelBytes = async (onProgress: ProgressHandler): Promise<Uint8Array<ArrayBuffer>> => {
  const cache = await openModelCache();
  const cached = cache ? await readCachedModel(cache) : null;
  if (cached) return cached;
  const bytes = await downloadModel(onProgress);
  if (!(await isTrustedModel(bytes))) throw new BackgroundRemovalError("network", "Model checksum did not match");
  if (cache) await keepModel(cache, bytes);
  return bytes;
};
