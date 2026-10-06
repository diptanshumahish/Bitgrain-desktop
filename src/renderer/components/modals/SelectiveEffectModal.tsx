import React, { useRef, useState, useEffect, useCallback } from "react";
import { X, Check, Brush, Eraser } from "lucide-react";
import { imageSignal } from "../../store/image-store";
import { SELECTIVE_EFFECTS, getSelectiveEffect } from "../../engine/selective/selective-effects";
import { renderSelectiveResult } from "../../engine/selective/render-selective-result";
import { createCanvas, stampBrush } from "../../engine/selective/brush-canvas";
import { replaceWorkingImage } from "../../pages/home-page/replace-working-image";
import { MAX_UPLOAD_LONG_EDGE } from "../../pages/home-page/handle-image-upload";
import { trackEvent } from "../../lib/tracker";

interface SelectiveEffectModalProps {
  onClose: () => void;
}

const WORK_MAX = 2000;
const DEFAULT_BRUSH = 80;
const BRUSH_MIN = 10;
const BRUSH_MAX = 240;

export const SelectiveEffectModal: React.FC<SelectiveEffectModalProps> = ({ onClose }) => {
  const imageUrl = imageSignal.value;
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const effectedRef = useRef<HTMLCanvasElement | null>(null);
  const dimsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const paintingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [ready, setReady] = useState(false);
  const [effectId, setEffectId] = useState(SELECTIVE_EFFECTS[0].id);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH);
  const [erase, setErase] = useState(false);
  const [inverted, setInverted] = useState(false);

  const composite = useCallback(() => {
    const display = displayRef.current;
    const img = imgRef.current;
    const effected = effectedRef.current;
    const mask = maskRef.current;
    if (!display || !img || !effected || !mask) return;
    const { width, height } = dimsRef.current;
    const ctx = display.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const temp = createCanvas(width, height);
    const tctx = temp.getContext("2d");
    if (!tctx) return;
    tctx.drawImage(effected, 0, 0);
    tctx.globalCompositeOperation = inverted ? "destination-out" : "destination-in";
    tctx.drawImage(mask, 0, 0);
    ctx.drawImage(temp, 0, 0);
  }, [inverted]);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
      const scale = Math.min(1, WORK_MAX / longEdge);
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      imgRef.current = img;
      dimsRef.current = { width, height };
      maskRef.current = createCanvas(width, height);
      effectedRef.current = getSelectiveEffect(effectId).render(img, width, height);
      if (displayRef.current) {
        displayRef.current.width = width;
        displayRef.current.height = height;
      }
      setReady(true);
    };
    img.src = imageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  useEffect(() => {
    if (!ready) return;
    const img = imgRef.current;
    if (!img) return;
    const { width, height } = dimsRef.current;
    effectedRef.current = getSelectiveEffect(effectId).render(img, width, height);
    composite();
  }, [ready, effectId, composite]);

  const toCanvasPoint = (event: React.PointerEvent): { x: number; y: number } | null => {
    const display = displayRef.current;
    if (!display) return null;
    const rect = display.getBoundingClientRect();
    const scaleX = display.width / rect.width;
    const scaleY = display.height / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  };

  const paint = (point: { x: number; y: number }) => {
    const mask = maskRef.current;
    const display = displayRef.current;
    if (!mask || !display) return;
    const ctx = mask.getContext("2d");
    if (!ctx) return;
    const radius = (brushSize / 2) * (display.width / display.getBoundingClientRect().width);
    ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
    const last = lastPointRef.current ?? point;
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(distance / (radius * 0.25)));
    for (let step = 0; step <= steps; step += 1) {
      stampBrush(ctx, last.x + (dx * step) / steps, last.y + (dy * step) / steps, radius);
    }
    ctx.globalCompositeOperation = "source-over";
    lastPointRef.current = point;
    composite();
  };

  const updateCursor = (event: React.PointerEvent) => {
    const cursor = cursorRef.current;
    const container = containerRef.current;
    if (!cursor || !container) return;
    const rect = container.getBoundingClientRect();
    cursor.style.display = "block";
    cursor.style.left = `${event.clientX - rect.left}px`;
    cursor.style.top = `${event.clientY - rect.top}px`;
    cursor.style.width = `${brushSize}px`;
    cursor.style.height = `${brushSize}px`;
  };

  const onPointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    paintingRef.current = true;
    lastPointRef.current = null;
    const point = toCanvasPoint(event);
    if (point) paint(point);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    updateCursor(event);
    if (!paintingRef.current) return;
    const point = toCanvasPoint(event);
    if (point) paint(point);
  };

  const onPointerUp = () => {
    paintingRef.current = false;
    lastPointRef.current = null;
  };

  const fillMask = () => {
    const mask = maskRef.current;
    if (!mask) return;
    const ctx = mask.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, mask.width, mask.height);
    composite();
  };

  const clearMask = () => {
    const mask = maskRef.current;
    if (!mask) return;
    mask.getContext("2d")?.clearRect(0, 0, mask.width, mask.height);
    composite();
  };

  const apply = async () => {
    const source = imgRef.current;
    const mask = maskRef.current;
    if (!source || !mask) return;
    const result = renderSelectiveResult({
      source,
      mask,
      effect: getSelectiveEffect(effectId),
      inverted,
      maxLongEdge: MAX_UPLOAD_LONG_EDGE,
    });
    try {
      await replaceWorkingImage(result);
      onClose();
    } catch (error) {
      trackEvent("home", "selective_apply_failed", {
        details: { message: error instanceof Error ? error.message : "unknown" },
      });
    }
  };

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm font-editorial">
      <div className="relative flex flex-col bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden max-w-[min(90vw,860px)] max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Brush size={14} /> brush effect
          </span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative flex items-center justify-center overflow-hidden min-w-[min(280px,90vw)] min-h-[200px] max-h-[calc(90vh-200px)] bg-zinc-900 cursor-none"
          onPointerLeave={() => {
            if (cursorRef.current) cursorRef.current.style.display = "none";
          }}
        >
          {ready ? (
            <canvas
              ref={displayRef}
              className="block max-w-full max-h-[calc(90vh-200px)] object-contain touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          ) : (
            <span className="text-xs text-zinc-500 py-16">loading image…</span>
          )}
          <div
            ref={cursorRef}
            className="pointer-events-none absolute hidden rounded-full border border-white/80 mix-blend-difference -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        <div className="px-4 py-3 border-t border-zinc-800 shrink-0 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {SELECTIVE_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setEffectId(effect.id)}
                className={`px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
                  effectId === effect.id
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                }`}
              >
                {effect.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">brush</span>
              <input
                type="range"
                min={BRUSH_MIN}
                max={BRUSH_MAX}
                value={brushSize}
                onChange={(event) => setBrushSize(Number(event.target.value))}
                className="accent-violet-500 h-1 w-28"
              />
            </div>
            <button
              onClick={() => setErase((value) => !value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] transition-colors ${
                erase ? "border-violet-400 bg-violet-500/15 text-white" : "border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Eraser size={12} /> erase
            </button>
            <button
              onClick={() => setInverted((value) => !value)}
              className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors ${
                inverted ? "border-violet-400 bg-violet-500/15 text-white" : "border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              invert
            </button>
            <button onClick={fillMask} className="px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] text-zinc-400 hover:text-white transition-colors">
              fill
            </button>
            <button onClick={clearMask} className="px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] text-zinc-400 hover:text-white transition-colors">
              clear
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-500">paint to apply the effect, erase to undo</span>
            <button
              onClick={() => void apply()}
              disabled={!ready}
              className="flex items-center gap-1.5 text-xs font-semibold text-black bg-white hover:bg-zinc-100 px-4 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={12} /> apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
