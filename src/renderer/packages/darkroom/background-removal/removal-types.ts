import type { RemovalErrorCode } from "@bitgrain/engine/background/removal-error";

export type RemovalBackend = "webgpu" | "wasm";
export type RemovalPhase = "downloading" | "preparing" | "removing";
export type RemovalSurface = "darkroom" | "studio";

export interface RemovalRequest {
  id: number;
  bitmap: ImageBitmap;
}

interface RemovalProgressMessage {
  type: "progress";
  id: number;
  phase: RemovalPhase;
  value: number;
}

interface RemovalDoneMessage {
  type: "done";
  id: number;
  blob: Blob;
  backend: RemovalBackend;
}

interface RemovalErrorMessage {
  type: "error";
  id: number;
  code: RemovalErrorCode;
  message: string;
}

export type RemovalWorkerMessage = RemovalProgressMessage | RemovalDoneMessage | RemovalErrorMessage;

export const INDETERMINATE_PROGRESS = -1;
