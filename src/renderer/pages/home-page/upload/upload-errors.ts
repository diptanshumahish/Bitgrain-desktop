import { emitStatusToast } from "../../../components/portal/status-toast/status-toast-events";

export class UnreadableImageError extends Error {
  constructor() {
    super("The file could not be decoded as an image");
    this.name = "UnreadableImageError";
  }
}

export class ConversionFailedError extends Error {
  readonly format: ConversionFormat;
  constructor(format: ConversionFormat, cause: unknown) {
    super(`Could not convert ${format} file`, { cause });
    this.name = "ConversionFailedError";
    this.format = format;
  }
}

export class StaleUploadError extends Error {
  constructor() {
    super("A newer upload replaced this one");
    this.name = "StaleUploadError";
  }
}

export type ConversionFormat = "heic" | "raw" | "tiff";

const CONVERSION_HELP: Record<ConversionFormat, { title: string; detail: string }> = {
  heic: {
    title: "We couldn't open that HEIC photo.",
    detail: "Try sharing it as a JPG from Photos, or set the camera to Most Compatible.",
  },
  raw: {
    title: "We couldn't open that RAW file.",
    detail: "Try exporting a JPG or TIFF from your camera app first.",
  },
  tiff: {
    title: "We couldn't open that TIFF file.",
    detail: "Try saving it as a JPG or PNG and open it again.",
  },
};

const UNREADABLE_MESSAGE = {
  title: "That file isn't an image we can open.",
  detail: "Try a JPG, PNG, WebP or HEIC.",
};

export const reportUploadFailure = (error: unknown): void => {
  if (error instanceof StaleUploadError) return;
  if (error instanceof ConversionFailedError) {
    emitStatusToast(CONVERSION_HELP[error.format]);
    return;
  }
  emitStatusToast(UNREADABLE_MESSAGE);
};
