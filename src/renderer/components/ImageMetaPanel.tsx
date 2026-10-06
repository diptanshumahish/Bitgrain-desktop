import React from "react";

export interface ImageMeta {
  name: string;
  width: number;
  height: number;
  sizeBytes: number | null; // null for sample images
  mimeType: string;
}

const KB = 1024;
const MB = KB * KB;
const MEGA = 1_000_000;
const KILO = 1000;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspectRatio(width: number, height: number): string {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function formatBytes(bytes: number): string {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

function formatMime(mime: string, name: string): string {
  if (mime === "image/jpeg" || name.match(/\.jpe?g$/i)) return "JPEG";
  if (mime === "image/png") return "PNG";
  if (mime === "image/webp") return "WebP";
  if (mime === "image/gif") return "GIF";
  if (mime === "image/avif") return "AVIF";
  if (mime === "image/heic" || mime === "image/heif") return "HEIC";
  return mime.replace("image/", "").toUpperCase();
}

function megapixels(width: number, height: number): string {
  const megapixelValue = (width * height) / MEGA;
  return megapixelValue >= 1 ? `${megapixelValue.toFixed(1)} MP` : `${((width * height) / KILO).toFixed(0)} KP`;
}

interface Props {
  meta: ImageMeta;
}

export const ImageMetaPanel: React.FC<Props> = ({ meta }) => {
  const ratio = aspectRatio(meta.width, meta.height);
  const formatLabel = formatMime(meta.mimeType, meta.name);
  const megapixelLabel = megapixels(meta.width, meta.height);

  const line1 = `dim ${meta.width}×${meta.height}  ·  ratio ${ratio}`;
  const line2 = [
    `${megapixelLabel}`,
    ...(meta.sizeBytes != null
      ? [`${formatBytes(meta.sizeBytes)} · ${formatLabel}`]
      : []),
  ].join("  ·  ");

  return (
    <div className="hidden md:flex flex-col gap-1 absolute bottom-5 left-5 z-40 font-editorial bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-[20px] border border-black/5 dark:border-white/5">
      <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 tabular-nums leading-none   ">
        {line1}
      </p>
      <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 tabular-nums leading-none">
        {line2}
      </p>
    </div>
  );
};
