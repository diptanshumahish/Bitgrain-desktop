export type ExportFormat = "png" | "webp" | "jpeg" | "png-hdr";

export interface RasterExportOptions {
  format: ExportFormat;
  scale: number;
  transparent: boolean;
  quality: number;
}

export type DownloadRasterFn = (options: RasterExportOptions) => void;

export interface EncodeRequest {
  id: number;
  format: ExportFormat;
  quality: number;
  transparent: boolean;
  bgColor: string;
  width: number;
  height: number;
  buffer: ArrayBuffer;
  peakNits?: number;
  lossless?: boolean;
}

export type EncodeResponse =
  | { type: "progress"; id: number; value: number }
  | { type: "done"; id: number; bytes: ArrayBuffer; mime: string }
  | { type: "error"; id: number; message: string };

export const MIME_BY_FORMAT: Record<ExportFormat, string> = {
  png: "image/png",
  webp: "image/webp",
  jpeg: "image/jpeg",
  "png-hdr": "image/png",
};

export const EXTENSION_BY_FORMAT: Record<ExportFormat, string> = {
  png: "png",
  webp: "webp",
  jpeg: "jpg",
  "png-hdr": "png",
};

export const HDR_FORMATS: ReadonlySet<ExportFormat> = new Set<ExportFormat>(["png-hdr"]);

export function isHdrFormat(format: ExportFormat): boolean {
  return HDR_FORMATS.has(format);
}

const PNG_MIN_COLORS = 2;
const FULL_COLOR_QUALITY = 1;

export function isFullColorQuality(qualityFraction: number): boolean {
  return qualityFraction >= FULL_COLOR_QUALITY;
}
const PNG_MAX_COLORS = 256;

export function qualityToColorCount(qualityFraction: number): number {
  const clamped = Math.max(0, Math.min(1, qualityFraction));
  const span = PNG_MAX_COLORS - PNG_MIN_COLORS;
  const colors = Math.round(PNG_MIN_COLORS + clamped * span);
  return Math.max(PNG_MIN_COLORS, Math.min(PNG_MAX_COLORS, colors));
}
