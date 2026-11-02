import React, { useRef, useState, useEffect, useCallback } from "react";
import { X, Check, RotateCcw } from "lucide-react";
import { imageSignal } from "../../store/image-store";
import { replaceWorkingImage } from "../../pages/home-page/replace-working-image";
import { trackEvent } from "../../lib/tracker";
import { CropOverlay } from "./crop/CropOverlay";
import { CropAspectChips } from "./crop/CropAspectChips";
import { centeredAspectRect, lockRectToAspect, type CropRect } from "./crop/crop-aspect";

type Handle = "tl" | "tr" | "bl" | "br" | "move" | null;

const MIN_SIZE = 20;
const HANDLE_SIZE = 10;

interface CropModalProps {
  onClose: () => void;
}

export const CropModal: React.FC<CropModalProps> = ({ onClose }) => {
  const imageUrl = imageSignal.value;
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [imgDisplay, setImgDisplay] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [aspectId, setAspectId] = useState("free");
  const aspectRatioRef = useRef<number | null>(null);

  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startRect: CropRect;
  } | null>(null);

  const measureImg = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const container = containerRef.current!.getBoundingClientRect();
    const display = {
      x: r.left - container.left,
      y: r.top - container.top,
      w: r.width,
      h: r.height,
    };
    setImgDisplay(display);
    setRect({ x: 0, y: 0, w: display.w, h: display.h });
  }, []);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (el.complete) {
      setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
      measureImg();
    } else {
      el.onload = () => {
        setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
        measureImg();
      };
    }
    window.addEventListener("resize", measureImg);
    return () => window.removeEventListener("resize", measureImg);
  }, [measureImg]);

  if (!imageUrl) return null;

  const getHandle = (e: React.PointerEvent): Handle => {
    if (!imgDisplay) return null;
    const container = containerRef.current!.getBoundingClientRect();
    const cx = e.clientX - container.left - imgDisplay.x;
    const cy = e.clientY - container.top - imgDisplay.y;
    const near = (v: number, target: number) => Math.abs(v - target) <= HANDLE_SIZE;
    const inRect =
      cx >= rect.x - HANDLE_SIZE &&
      cx <= rect.x + rect.w + HANDLE_SIZE &&
      cy >= rect.y - HANDLE_SIZE &&
      cy <= rect.y + rect.h + HANDLE_SIZE;
    if (!inRect) return null;
    if (near(cx, rect.x) && near(cy, rect.y)) return "tl";
    if (near(cx, rect.x + rect.w) && near(cy, rect.y)) return "tr";
    if (near(cx, rect.x) && near(cy, rect.y + rect.h)) return "bl";
    if (near(cx, rect.x + rect.w) && near(cy, rect.y + rect.h)) return "br";
    if (cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h) return "move";
    return null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const handle = getHandle(e);
    if (!handle || !imgDisplay) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startRect: { ...rect } };
    (e.currentTarget as HTMLElement).style.cursor = handle === "move" ? "move" : handle === "tl" || handle === "br" ? "nwse-resize" : "nesw-resize";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !imgDisplay) return;
    const { handle, startX, startY, startRect: sr } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const maxW = imgDisplay.w;
    const maxH = imgDisplay.h;
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    let { x, y, w, h } = sr;
    if (handle === "move") {
      x = clamp(sr.x + dx, 0, maxW - sr.w);
      y = clamp(sr.y + dy, 0, maxH - sr.h);
    } else if (handle === "br") {
      w = clamp(sr.w + dx, MIN_SIZE, maxW - sr.x);
      h = clamp(sr.h + dy, MIN_SIZE, maxH - sr.y);
    } else if (handle === "tr") {
      w = clamp(sr.w + dx, MIN_SIZE, maxW - sr.x);
      const newY = clamp(sr.y + dy, 0, sr.y + sr.h - MIN_SIZE);
      h = sr.h + sr.y - newY;
      y = newY;
    } else if (handle === "bl") {
      const newX = clamp(sr.x + dx, 0, sr.x + sr.w - MIN_SIZE);
      w = sr.w + sr.x - newX;
      x = newX;
      h = clamp(sr.h + dy, MIN_SIZE, maxH - sr.y);
    } else if (handle === "tl") {
      const newX = clamp(sr.x + dx, 0, sr.x + sr.w - MIN_SIZE);
      const newY = clamp(sr.y + dy, 0, sr.y + sr.h - MIN_SIZE);
      w = sr.w + sr.x - newX;
      h = sr.h + sr.y - newY;
      x = newX;
      y = newY;
    }
    const ratio = aspectRatioRef.current;
    const next = { x, y, w, h };
    if (ratio && handle !== "move") {
      setRect(lockRectToAspect(next, handle === "tl" || handle === "bl", handle === "tl" || handle === "tr", ratio, maxW, maxH));
      return;
    }
    setRect(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    (e.currentTarget as HTMLElement).style.cursor = "crosshair";
  };

  const reset = () => {
    aspectRatioRef.current = null;
    setAspectId("free");
    if (imgDisplay) setRect({ x: 0, y: 0, w: imgDisplay.w, h: imgDisplay.h });
  };

  const selectAspect = (id: string, ratio: number | null): void => {
    aspectRatioRef.current = ratio;
    setAspectId(id);
    if (!imgDisplay) return;
    setRect(ratio ? centeredAspectRect(imgDisplay.w, imgDisplay.h, ratio) : { x: 0, y: 0, w: imgDisplay.w, h: imgDisplay.h });
    trackEvent("home", "crop_aspect_selected", { details: { aspect: id } });
  };

  const toImagePixels = (value: number, axis: "x" | "y"): number => {
    if (!imgNatural || !imgDisplay) return Math.round(value);
    const ratio = axis === "x" ? imgNatural.w / imgDisplay.w : imgNatural.h / imgDisplay.h;
    return Math.round(value * ratio);
  };

  const apply = async () => {
    if (!imgNatural || !imgDisplay || !imgRef.current) return;
    const sx = toImagePixels(rect.x, "x");
    const sy = toImagePixels(rect.y, "y");
    const sw = toImagePixels(rect.w, "x");
    const sh = toImagePixels(rect.h, "y");
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, sw, sh);
    try {
      await replaceWorkingImage(canvas);
      trackEvent("home", "crop_applied", { details: { width: sw, height: sh } });
      onClose();
    } catch (error) {
      trackEvent("home", "crop_failed", {
        details: { message: error instanceof Error ? error.message : "unknown" },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm font-editorial">
      <div className="relative flex flex-col bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden max-w-[min(90vw,860px)] max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-1 border-b border-zinc-800 shrink-0">
          <span className="text-sm font-semibold text-white">Crop image</span>
          <button type="button" aria-label="Close crop" onClick={() => { trackEvent("home", "crop_cancelled"); onClose(); }} className="w-11 h-11 -mr-3 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative flex items-center justify-center overflow-hidden bg-zinc-900 select-none min-w-[min(280px,90vw)] min-h-[200px] max-h-[calc(90vh-170px)] cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="crop"
            crossOrigin="anonymous"
            className="block max-w-full max-h-[calc(90vh-170px)] object-contain pointer-events-none select-none"
            draggable={false}
          />
          {imgDisplay && <CropOverlay display={imgDisplay} rect={rect} handleSize={HANDLE_SIZE} />}
        </div>

        <div className="px-3 pt-3 border-t border-zinc-800 shrink-0">
          <CropAspectChips activeId={aspectId} onSelect={selectAspect} />
        </div>

        <div className="flex items-center justify-between px-4 py-3 shrink-0 gap-3">
          <span className="text-xs text-zinc-500">
            {imgDisplay ? `${toImagePixels(rect.w, "x")} × ${toImagePixels(rect.h, "y")} px` : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all"
            >
              <RotateCcw size={12} /> Reset
            </button>
            <button
              onClick={() => void apply()}
              className="flex items-center gap-1.5 text-xs font-semibold text-black bg-white hover:bg-zinc-100 px-4 py-1.5 rounded-lg transition-all"
            >
              <Check size={12} /> Apply crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
