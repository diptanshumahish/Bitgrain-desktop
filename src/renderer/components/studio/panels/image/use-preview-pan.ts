import type React from "react";
import { useRef } from "react";
import type { ImageCrop } from "../../../../data/studioTypes";
import { DEFAULT_CROP, fittedRect, panCrop, type ImageFit } from "../../../../utils/image-crop";

interface PreviewPanOptions {
  fit: ImageFit;
  crop?: ImageCrop;
  imgRef: React.RefObject<HTMLImageElement | null>;
  onChange: (crop: ImageCrop) => void;
}

interface PreviewPanHandlers {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
}

export function usePreviewPan({ fit, crop, imgRef, onChange }: PreviewPanOptions): PreviewPanHandlers {
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const liveCropRef = useRef<ImageCrop>(crop ?? DEFAULT_CROP);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    lastPointRef.current = { x: event.clientX, y: event.clientY };
    liveCropRef.current = crop ?? DEFAULT_CROP;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const last = lastPointRef.current;
    const img = imgRef.current;
    if (!last || !img || !img.naturalWidth) return;
    const box = event.currentTarget.getBoundingClientRect();
    const rect = fittedRect(fit, img.naturalWidth, img.naturalHeight, { x: 0, y: 0, width: box.width, height: box.height }, liveCropRef.current);
    const next = panCrop(liveCropRef.current, box.width - rect.width, box.height - rect.height, event.clientX - last.x, event.clientY - last.y);
    lastPointRef.current = { x: event.clientX, y: event.clientY };
    liveCropRef.current = next;
    onChange(next);
  };

  const onPointerUp = () => {
    lastPointRef.current = null;
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}
