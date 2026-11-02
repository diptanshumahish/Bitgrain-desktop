import type React from "react";
import { useEffect, useRef } from "react";
import type { ImageCrop } from "../../../../data/studioTypes";
import { DEFAULT_CROP, clampCrop, fittedRect, panCrop, type ImageFit } from "../../../../utils/image-crop";
import { exitCropMode } from "./crop-mode-signal";

interface CropInteractionOptions {
  active: boolean;
  fit: ImageFit;
  crop?: ImageCrop;
  width: number;
  height: number;
  scale: number;
  flipH?: boolean;
  flipV?: boolean;
  wrapRef: React.RefObject<HTMLDivElement | null>;
  imgRef: React.RefObject<HTMLImageElement | null>;
  onCropChange?: (crop: ImageCrop) => void;
}

interface CropHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: () => void;
}

const WHEEL_ZOOM_SPEED = 0.0015;
const PANEL_SELECTOR = '[data-tutorial="studio-properties"]';

export function useCropInteraction(options: CropInteractionOptions): CropHandlers {
  const { active, fit, crop, width, height, scale, flipH, flipV, wrapRef, imgRef, onCropChange } = options;
  const liveCropRef = useRef<ImageCrop>(crop ?? DEFAULT_CROP);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const changeRef = useRef(onCropChange);

  useEffect(() => {
    liveCropRef.current = crop ?? DEFAULT_CROP;
    changeRef.current = onCropChange;
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!active || !wrap) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const current = liveCropRef.current;
      const next = clampCrop({ ...current, zoom: current.zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED) });
      liveCropRef.current = next;
      changeRef.current?.(next);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") exitCropMode();
    };
    const onOutsidePress = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || wrap.contains(target) || target.closest(PANEL_SELECTOR)) return;
      exitCropMode();
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutsidePress, true);
    return () => {
      wrap.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutsidePress, true);
    };
  }, [active, wrapRef]);

  const onPointerDown = (event: React.PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    lastPointRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const last = lastPointRef.current;
    const img = imgRef.current;
    if (!last || !img || !img.naturalWidth) return;
    const deltaX = ((event.clientX - last.x) / scale) * (flipH ? -1 : 1);
    const deltaY = ((event.clientY - last.y) / scale) * (flipV ? -1 : 1);
    lastPointRef.current = { x: event.clientX, y: event.clientY };
    const current = liveCropRef.current;
    const rect = fittedRect(fit, img.naturalWidth, img.naturalHeight, { x: 0, y: 0, width, height }, current);
    const next = panCrop(current, width - rect.width, height - rect.height, deltaX, deltaY);
    liveCropRef.current = next;
    changeRef.current?.(next);
  };

  const onPointerUp = () => {
    lastPointRef.current = null;
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}
