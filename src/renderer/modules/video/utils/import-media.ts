import { putMediaBlob } from "./media-blob-store";
import {
  extractImageThumbnail,
  extractVideoThumbnail,
} from "../engine/extract-thumbnail";
import { extractWaveform } from "../engine/extract-waveform";
import { newId } from "./id";
import type { MediaAsset, MediaKind } from "../types";

function detectKind(file: File): MediaKind | null {
  const type = file.type.toLowerCase();
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("image/")) return "image";

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) return null;

  const videoExts = ["mp4", "webm", "mov", "m4v", "mkv"];
  if (videoExts.includes(ext)) return "video";

  const audioExts = ["mp3", "wav", "m4a", "ogg", "aac", "flac"];
  if (audioExts.includes(ext)) return "audio";

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"];
  if (imageExts.includes(ext)) return "image";

  return null;
}

export async function importMediaFile(file: File): Promise<MediaAsset | null> {
  const kind = detectKind(file);
  if (!kind) return null;

  const blobId = newId();
  await putMediaBlob(blobId, file);

  const base: MediaAsset = {
    id: newId(),
    kind,
    name: file.name,
    blobId,
    duration: 0,
  };

  if (kind === "video") {
    const thumb = await extractVideoThumbnail(file);
    const wave = await extractWaveform(file);
    return {
      ...base,
      duration: thumb.duration,
      width: thumb.width,
      height: thumb.height,
      thumbnailDataUrl: thumb.dataUrl,
      waveformPeaks: wave.peaks,
    };
  }

  if (kind === "image") {
    const thumb = await extractImageThumbnail(file);
    return {
      ...base,
      duration: 5,
      width: thumb.width,
      height: thumb.height,
      thumbnailDataUrl: thumb.dataUrl,
    };
  }

  const wave = await extractWaveform(file);
  return {
    ...base,
    duration: wave.duration,
    waveformPeaks: wave.peaks,
  };
}

export async function importMediaFiles(files: FileList | File[]): Promise<MediaAsset[]> {
  const results: MediaAsset[] = [];
  const arr = Array.from(files);
  for (const file of arr) {
    try {
      const asset = await importMediaFile(file);
      if (asset) results.push(asset);
    } catch (err) {
      console.error("Failed to import media", file.name, err);
    }
  }
  return results;
}
