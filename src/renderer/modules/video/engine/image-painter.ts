import type {
  ImageClip,
  ImageTrack,
  MediaAsset,
  OverlayFilters,
  VideoProject,
} from "../types";
import { getImageBitmap } from "./frame-source";
import { clipFadeAlpha } from "../utils/clip-fade";
import { renderOverlayWithEffect } from "./overlay-effects/apply-overlay-effect";

const OVERLAY_FIT_FRACTION = 0.4;
const DEG_TO_RAD = Math.PI / 180;

export interface ActiveImageOverlay {
  clip: ImageClip;
  asset: MediaAsset;
}

export function activeImageOverlaysAt(
  project: VideoProject,
  time: number,
): ActiveImageOverlay[] {
  const result: ActiveImageOverlay[] = [];
  const tracks = project.tracks.filter(
    (t): t is ImageTrack => t.kind === "image" && t.visible,
  );
  for (const track of tracks) {
    for (const clip of track.clips) {
      if (time >= clip.trackStart && time < clip.trackStart + clip.duration) {
        const asset = project.mediaPool.find((a) => a.id === clip.assetId);
        if (asset) result.push({ clip, asset });
      }
    }
  }
  return result;
}

export function buildFilterString(filters: OverlayFilters | undefined): string {
  if (!filters) return "none";
  const parts: string[] = [];
  if (filters.blur) parts.push(`blur(${filters.blur}px)`);
  if (filters.grayscale) parts.push(`grayscale(${filters.grayscale})`);
  if (filters.invert) parts.push(`invert(${filters.invert})`);
  if (filters.sepia) parts.push(`sepia(${filters.sepia})`);
  if (filters.hueRotate) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  if (filters.saturate !== undefined && filters.saturate !== 1) {
    parts.push(`saturate(${filters.saturate})`);
  }
  if (filters.brightness !== undefined && filters.brightness !== 1) {
    parts.push(`brightness(${filters.brightness})`);
  }
  if (filters.contrast !== undefined && filters.contrast !== 1) {
    parts.push(`contrast(${filters.contrast})`);
  }
  return parts.length > 0 ? parts.join(" ") : "none";
}

interface PaintImageOverlayOpts {
  clip: ImageClip;
  image: HTMLImageElement;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  clipLocalTime: number;
}

export function paintImageOverlay(opts: PaintImageOverlayOpts): void {
  const { clip, image, ctx, canvasWidth, canvasHeight, clipLocalTime } = opts;
  const fade = clipFadeAlpha(clip.duration, clipLocalTime, clip.fadeIn, clip.fadeOut);
  const alpha = (clip.opacity ?? 1) * fade;
  if (alpha <= 0) return;

  const naturalWidth = image.naturalWidth || 1;
  const naturalHeight = image.naturalHeight || 1;
  const fitScale = Math.min(
    (canvasWidth * OVERLAY_FIT_FRACTION) / naturalWidth,
    (canvasHeight * OVERLAY_FIT_FRACTION) / naturalHeight,
  );
  const drawWidth = naturalWidth * fitScale * (clip.scale ?? 1);
  const drawHeight = naturalHeight * fitScale * (clip.scale ?? 1);
  if (drawWidth <= 0 || drawHeight <= 0) return;

  const centerX = clip.position.x * canvasWidth;
  const centerY = clip.position.y * canvasHeight;

  const source = clip.effect
    ? renderOverlayWithEffect(image, drawWidth, drawHeight, clip.effect, clipLocalTime) ?? image
    : image;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = buildFilterString(clip.filters);
  ctx.imageSmoothingEnabled = true;
  ctx.translate(centerX, centerY);
  if (clip.rotation) ctx.rotate(clip.rotation * DEG_TO_RAD);
  ctx.drawImage(source, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

export async function preloadOverlayImages(project: VideoProject): Promise<void> {
  const assetIds = new Set<string>();
  for (const track of project.tracks) {
    if (track.kind !== "image") continue;
    for (const clip of track.clips) assetIds.add(clip.assetId);
  }
  await Promise.all(
    [...assetIds].map((assetId) => {
      const asset = project.mediaPool.find((a) => a.id === assetId);
      return asset ? getImageBitmap(asset) : Promise.resolve(null);
    }),
  );
}
