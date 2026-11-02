import React, { useRef, useState, useEffect, useCallback } from "react";
import { X, Check, RotateCcw } from "lucide-react";
import { imageSignal } from "../../state/image-store";
import { commitImageEdit } from "../../editor/image-edits/commit-image-edit";
import { trackEvent } from "@bitgrain/platform/tracker";
import { CropOverlay } from "./crop/CropOverlay";
import { CropAspectChips } from "./crop/CropAspectChips";
import { CropOrientButtons } from "./crop/CropOrientButtons";
import { centeredAspectRect, lockRectToAspect, type CropRect } from "./crop/crop-aspect";
import { CROP_HANDLE_SIZE, cursorForHandle, dragCropRect, findCropHandle, type CropHandle } from "./crop/crop-drag";
import type { OrientAction } from "./crop/orient-image";
import { useOrientedSource } from "./crop/use-oriented-source";
import { Button } from "@bitgrain/ui/components/Button";
import { useEscapeClose } from "@bitgrain/ui/overlays/use-escape-close";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

const IDLE_CURSOR = "crosshair";

interface CropModalProps {
  onClose: () => void;
}

interface CropDrag {
  handle: CropHandle;
  startX: number;
  startY: number;
  startRect: CropRect;
}

const fullOrAspectRect = (display: CropRect, ratio: number | null): CropRect =>
  ratio ? centeredAspectRect(display.w, display.h, ratio) : { x: 0, y: 0, w: display.w, h: display.h };

export const CropModal: React.FC<CropModalProps> = ({ onClose }) => {
  const imageUrl = imageSignal.value;
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [imgDisplay, setImgDisplay] = useState<CropRect | null>(null);
  const [aspectId, setAspectId] = useState("free");
  const { displayUrl, orienting, orient, resetOrientation } = useOrientedSource(imageUrl);
  useEscapeClose(true, onClose);
  const aspectRatioRef = useRef<number | null>(null);
  const dragRef = useRef<CropDrag | null>(null);

  const measureImg = useCallback(() => {
    const element = imgRef.current;
    const container = containerRef.current;
    if (!element || !container) return;
    const bounds = element.getBoundingClientRect();
    const containerBounds = container.getBoundingClientRect();
    const display = { x: bounds.left - containerBounds.left, y: bounds.top - containerBounds.top, w: bounds.width, h: bounds.height };
    setImgDisplay(display);
    setRect(fullOrAspectRect(display, aspectRatioRef.current));
  }, []);

  const handleImgLoad = (): void => {
    const element = imgRef.current;
    if (!element) return;
    setImgNatural({ w: element.naturalWidth, h: element.naturalHeight });
    measureImg();
  };

  useEffect(() => {
    window.addEventListener("resize", measureImg);
    return () => window.removeEventListener("resize", measureImg);
  }, [measureImg]);

  if (!imageUrl) return null;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!imgDisplay || !containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const handle = findCropHandle(event.clientX - container.left - imgDisplay.x, event.clientY - container.top - imgDisplay.y, rect);
    if (!handle) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { handle, startX: event.clientX, startY: event.clientY, startRect: { ...rect } };
    event.currentTarget.style.cursor = cursorForHandle(handle);
  };

  const onPointerMove = (event: React.PointerEvent): void => {
    const drag = dragRef.current;
    if (!drag || !imgDisplay) return;
    const next = dragCropRect(drag.handle, drag.startRect, event.clientX - drag.startX, event.clientY - drag.startY, imgDisplay.w, imgDisplay.h);
    const ratio = aspectRatioRef.current;
    if (!ratio || drag.handle === "move") {
      setRect(next);
      return;
    }
    const fromLeft = drag.handle === "tl" || drag.handle === "bl";
    const fromTop = drag.handle === "tl" || drag.handle === "tr";
    setRect(lockRectToAspect(next, fromLeft, fromTop, ratio, imgDisplay.w, imgDisplay.h));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    dragRef.current = null;
    event.currentTarget.style.cursor = IDLE_CURSOR;
  };

  const reset = (): void => {
    aspectRatioRef.current = null;
    setAspectId("free");
    resetOrientation();
    if (imgDisplay) setRect(fullOrAspectRect(imgDisplay, null));
  };

  const selectAspect = (id: string, ratio: number | null): void => {
    aspectRatioRef.current = ratio;
    setAspectId(id);
    if (imgDisplay) setRect(fullOrAspectRect(imgDisplay, ratio));
    trackEvent("home", "crop_aspect_selected", { details: { aspect: id } });
  };

  const handleOrient = (action: OrientAction): void => {
    if (!imgRef.current) return;
    trackEvent("home", "crop_orient", { details: { action } });
    orient(imgRef.current, action).catch((error: unknown) => {
      console.error("rotate failed:", error);
      emitStatusToast({ title: "We couldn't turn the photo.", detail: "Try again in a moment." });
    });
  };

  const toImagePixels = (value: number, axis: "x" | "y"): number => {
    if (!imgNatural || !imgDisplay) return Math.round(value);
    const ratio = axis === "x" ? imgNatural.w / imgDisplay.w : imgNatural.h / imgDisplay.h;
    return Math.round(value * ratio);
  };

  const renderSelection = (): HTMLCanvasElement | null => {
    if (!imgRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = toImagePixels(rect.w, "x");
    canvas.height = toImagePixels(rect.h, "y");
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(imgRef.current, toImagePixels(rect.x, "x"), toImagePixels(rect.y, "y"), canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const apply = async (): Promise<void> => {
    const canvas = imgNatural && imgDisplay ? renderSelection() : null;
    if (!canvas) return;
    try {
      await commitImageEdit(canvas);
      trackEvent("home", "crop_applied", { details: { width: canvas.width, height: canvas.height } });
      onClose();
    } catch (error) {
      console.error("crop failed:", error);
      emitStatusToast({ title: "We couldn't crop the photo.", detail: "Try again, or pick a smaller area." });
      trackEvent("home", "crop_failed", {
        details: { message: error instanceof Error ? error.message : "unknown" },
      });
    }
  };

  return (
    <div className={`dark fixed inset-0 ${MODAL_LAYER} flex items-center justify-center bg-black/80 backdrop-blur-sm font-editorial`}>
      <div role="dialog" aria-modal="true" aria-label="Crop and rotate" className="relative flex flex-col bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden max-w-[min(90vw,860px)] max-h-[90dvh]">
        <div className="flex items-center justify-between px-4 py-1 border-b border-zinc-800 shrink-0">
          <span className="text-sm font-semibold text-white">Crop and rotate</span>
          <button type="button" aria-label="Close crop" onClick={() => { trackEvent("home", "crop_cancelled"); onClose(); }} className="w-11 h-11 -mr-3 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative flex items-center justify-center overflow-hidden bg-zinc-900 select-none min-w-[min(280px,90vw)] min-h-[200px] max-h-[calc(90dvh-170px)] cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img
            ref={imgRef}
            src={displayUrl ?? imageUrl}
            alt="Photo being cropped"
            crossOrigin="anonymous"
            onLoad={handleImgLoad}
            className="block max-w-full max-h-[calc(90dvh-170px)] object-contain pointer-events-none select-none"
            draggable={false}
          />
          {imgDisplay && <CropOverlay display={imgDisplay} rect={rect} handleSize={CROP_HANDLE_SIZE} />}
        </div>

        <div className="flex items-center gap-1.5 px-3 pt-3 border-t border-zinc-800 shrink-0">
          <CropOrientButtons busy={orienting} onOrient={handleOrient} />
          <div className="w-px h-5 bg-zinc-800 shrink-0" />
          <div className="min-w-0 flex-1">
            <CropAspectChips activeId={aspectId} onSelect={selectAspect} />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 shrink-0 gap-3">
          <span className="text-xs text-zinc-500">
            {imgDisplay ? `${toImagePixels(rect.w, "x")} × ${toImagePixels(rect.h, "y")} px` : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw size={12} /> Reset
            </Button>
            <Button variant="primary" size="sm" disabled={orienting} onClick={() => void apply()}>
              <Check size={12} /> Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
