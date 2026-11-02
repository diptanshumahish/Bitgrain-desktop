import { sha256HexSync } from "../hash/sha256";

type ProgressHandler = (value: number) => void;

const HEX_RADIX = 16;
const HEX_PAIR = 2;

const hasSubtleCrypto = (): boolean => typeof crypto !== "undefined" && typeof crypto.subtle?.digest === "function";

export const sha256Hex = async (bytes: Uint8Array<ArrayBuffer>): Promise<string> => {
  if (!hasSubtleCrypto()) return sha256HexSync(bytes);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(HEX_RADIX).padStart(HEX_PAIR, "0")).join("");
};

const joinChunks = (chunks: Uint8Array[], length: number): Uint8Array<ArrayBuffer> => {
  const joined = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.length;
  }
  return joined;
};

export const readWithProgress = async (response: Response, expectedBytes: number, onProgress: ProgressHandler): Promise<Uint8Array<ArrayBuffer>> => {
  const total = Number(response.headers.get("content-length")) || expectedBytes;
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array(await response.arrayBuffer());
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (let next = await reader.read(); !next.done; next = await reader.read()) {
    chunks.push(next.value);
    received += next.value.length;
    onProgress(Math.min(received / total, 1));
  }
  return joinChunks(chunks, received);
};
