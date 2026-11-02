import type { ImageMeta } from "../../state/image-meta";

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const PIXELS_PER_MEGAPIXEL = 1_000_000;

const MIME_LABELS: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "image/avif": "AVIF",
  "image/heic": "HEIC",
  "image/heif": "HEIC",
};

const formatBytes = (bytes: number): string => {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
};

const formatMime = (mime: string, name: string): string => {
  const known = MIME_LABELS[mime];
  if (known) return known;
  if (/\.jpe?g$/i.test(name)) return "JPEG";
  return mime.replace("image/", "").toUpperCase();
};

export const formatImageMetaParts = (meta: ImageMeta): string[] => {
  const megapixels = `${((meta.width * meta.height) / PIXELS_PER_MEGAPIXEL).toFixed(1)} MP`;
  const parts = [`${meta.width} × ${meta.height}`, megapixels];
  if (meta.sizeBytes != null) parts.push(formatBytes(meta.sizeBytes));
  parts.push(formatMime(meta.mimeType, meta.name));
  return parts;
};
