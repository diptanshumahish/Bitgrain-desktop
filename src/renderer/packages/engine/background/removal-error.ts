export type RemovalErrorCode = "network" | "memory" | "unsupported" | "unreadable" | "unknown";

export class BackgroundRemovalError extends Error {
  readonly code: RemovalErrorCode;

  constructor(code: RemovalErrorCode, message: string) {
    super(message);
    this.name = "BackgroundRemovalError";
    this.code = code;
  }
}

export const removalErrorCode = (error: unknown): RemovalErrorCode =>
  error instanceof BackgroundRemovalError ? error.code : "unknown";
