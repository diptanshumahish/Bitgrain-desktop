import { BackgroundRemovalError, type RemovalErrorCode } from "@bitgrain/engine/background/removal-error";

const MEMORY_PATTERN = /memory|allocation|out of bounds|oom/i;

export const classifyError = (error: unknown): RemovalErrorCode => {
  if (error instanceof BackgroundRemovalError) return error.code;
  if (error instanceof RangeError) return "memory";
  const message = error instanceof Error ? error.message : String(error);
  return MEMORY_PATTERN.test(message) ? "memory" : "unknown";
};
