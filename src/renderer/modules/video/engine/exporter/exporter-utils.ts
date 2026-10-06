import { setExportProgress } from "./export-types";

export interface FlushableEncoder {
  encodeQueueSize: number;
  flush(): Promise<void>;
  close(): void;
}

export async function awaitQueue(encoder: FlushableEncoder, max = 4): Promise<void> {
  while (encoder.encodeQueueSize > max) {
    await new Promise<void>((r) => setTimeout(r, 8));
  }
}

export function safeFileName(name: string, ext: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${slug || "untitled"}-${timestamp}.${ext}`;
}

export function reportExportFailure(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  if (message === "cancelled") {
    setExportProgress({ status: "cancelled", message: "Export cancelled." });
    return;
  }
  setExportProgress({ status: "error", message: "Production failed", error: message });
}
