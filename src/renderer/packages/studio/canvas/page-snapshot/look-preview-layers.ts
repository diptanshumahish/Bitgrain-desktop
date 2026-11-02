import type { ImageLayer, Layer, UploadLayer } from "@bitgrain/studio-core/model/studio-types";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { isContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";
import { hasPhotoLook, lookFromLayer } from "@bitgrain/studio-core/effects/photo-look/photo-look";
import { releasePhotoLook } from "@bitgrain/darkroom/grading/studio/photo-look-cache";
import {
  acquirePhotoLookPreview,
  photoLookPreviewKey,
} from "@bitgrain/darkroom/grading/studio/photo-look-preview-url";
import { pixelSnapPreview } from "./pixel-snap-preview";

type LookLayer = ImageLayer | UploadLayer;

interface LookTarget {
  layer: LookLayer;
  src: string;
}

interface PreviewLayers {
  layers: Layer[];
  release: () => void;
}

const lookSource = (layer: LookLayer, pageImage: string | null): string | null =>
  layer.type === "image" ? resolveAssetUrl(layer.src) ?? pageImage : resolveAssetUrl(layer.src);

const collectTargets = (layers: Layer[], pageImage: string | null): LookTarget[] =>
  layers.flatMap((layer): LookTarget[] => {
    if (isContainerLayer(layer)) return collectTargets(layer.layers, pageImage);
    if (layer.type !== "image" && layer.type !== "upload") return [];
    const src = lookSource(layer, pageImage);
    return src && hasPhotoLook(lookFromLayer(layer)) ? [{ layer, src }] : [];
  });

const swapLooks = (layers: Layer[], previews: ReadonlyMap<string, string>): Layer[] =>
  layers.map((layer): Layer => {
    if (isContainerLayer(layer)) return { ...layer, layers: swapLooks(layer.layers, previews) } as Layer;
    const preview = previews.get(layer.id);
    if (!preview) return layer;
    return { ...layer, src: preview, bitgrainEffect: undefined, colorGrade: undefined, masks: undefined } as Layer;
  });

const needsPixelSnap = (layer: LookLayer): layer is UploadLayer => layer.type === "upload" && !!layer.bitgrainEffect;

const resolvePreview = async (target: LookTarget, pixelScale: number | null, ownedUrls: string[]): Promise<string> => {
  const preview = await acquirePhotoLookPreview(target.src, lookFromLayer(target.layer));
  if (pixelScale === null || !needsPixelSnap(target.layer)) return preview;
  const snapped = await pixelSnapPreview(preview, target.layer, pixelScale);
  if (snapped !== preview) ownedUrls.push(snapped);
  return snapped;
};

export const withLookPreviews = async (
  layers: Layer[],
  pageImage: string | null,
  pixelScale: number | null,
): Promise<PreviewLayers> => {
  const targets = collectTargets(layers, pageImage);
  const ownedUrls: string[] = [];
  const settled = await Promise.allSettled(targets.map((target) => resolvePreview(target, pixelScale, ownedUrls)));
  const previews = new Map<string, string>();
  settled.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") previews.set(targets[index].layer.id, outcome.value);
  });
  const heldKeys = targets.map((target) => photoLookPreviewKey(target.src, lookFromLayer(target.layer)));
  return {
    layers: swapLooks(layers, previews),
    release: () => {
      heldKeys.forEach(releasePhotoLook);
      ownedUrls.forEach((url) => URL.revokeObjectURL(url));
    },
  };
};
