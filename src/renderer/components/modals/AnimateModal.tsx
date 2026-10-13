import React, { useRef, useState, useEffect, useCallback } from "react";
import { resolveExportPlan } from "../../lib/plan-gate/resolve-export-plan";
import { X, Download, Film, BookOpen } from "lucide-react";
import { renderForExport } from "../output-preview/export-render";
import { useSignalValue } from "../../lib/signal";
import { themeSignal } from "../../store/global-theme-store";
import { imageSignal } from "../../store/image-store";
import { ANIMATORS, getAnimator } from "../../engine/animate/animators";
import { encodeAnimation } from "../../engine/animate/encode-animation";
import { trackEvent } from "../../lib/tracker";
import { getPlanLimits } from "../../config/plan-limits";
import { capLongEdgeForPlan } from "../../lib/plan-gate/plan-long-edge";
import { preloadWatermarkLogo, drawWatermarkPill } from "../../engine/watermark";
import { frameBaseCanvas, encodeLongEdgeFor } from "../../engine/animate/framing/frame-canvas";
import { animateFramingSignal } from "./animate/animate-framing-store";
import { AnimateFramingPicker } from "./animate/AnimateFramingPicker";
import { Slider } from "../studio/ui/slider";

interface AnimateModalProps {
  onClose: () => void;
}

const BG_LIGHT = "#fdf6e3";
const BG_DARK = "#111111";
const ENCODE_MAX = 1280;
const FPS_OPTIONS = [12, 24, 30];
const DEFAULT_FPS = 24;
const DEFAULT_DURATION = 3;
const DURATION_MIN = 1;
const DURATION_MAX = 8;
const DURATION_STEP = 0.5;

const toEven = (value: number): number => Math.max(2, Math.round(value / 2) * 2);

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const AnimateModal: React.FC<AnimateModalProps> = ({ onClose }) => {
  const isDark = useSignalValue(themeSignal) === "dark";
  const hasImage = !!imageSignal.value;
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const framedRef = useRef<HTMLCanvasElement | null>(null);
  const framing = useSignalValue(animateFramingSignal);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [animatorId, setAnimatorId] = useState(ANIMATORS[0].id);
  const [durationSec, setDurationSec] = useState(DEFAULT_DURATION);
  const [fps, setFps] = useState(DEFAULT_FPS);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasImage) return;
    let cancelled = false;
    renderForExport({ fgColor: "#000000", bgColor: isDark ? BG_DARK : BG_LIGHT })
      .then(({ canvas }) => {
        if (cancelled) return;
        baseRef.current = canvas;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("couldn't render the image");
      });
    return () => {
      cancelled = true;
    };
  }, [hasImage, isDark]);

  useEffect(() => {
    if (!ready) return;
    const source = baseRef.current;
    const canvas = previewCanvasRef.current;
    if (!source || !canvas) return;
    const base = frameBaseCanvas(source, framing);
    framedRef.current = base;
    canvas.width = base.width;
    canvas.height = base.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const animator = getAnimator(animatorId);
    const durationMs = durationSec * 1000;
    const start = performance.now();
    const loop = (now: number) => {
      const phase = ((now - start) % durationMs) / durationMs;
      animator.draw(ctx, base, phase, base.width, base.height);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, animatorId, durationSec, framing]);

  const handleExport = useCallback(async () => {
    const plan = await resolveExportPlan();
    if (!plan) return;
    const base = framedRef.current;
    if (!base) return;
    setExporting(true);
    setProgress(0);
    setError("");
    const longEdge = Math.max(base.width, base.height);
    const scale = Math.min(1, capLongEdgeForPlan(plan, encodeLongEdgeFor(framing, ENCODE_MAX)) / longEdge);
    const width = toEven(base.width * scale);
    const height = toEven(base.height * scale);
    const frameCount = Math.max(1, Math.round(durationSec * fps));
    const animator = getAnimator(animatorId);
    const watermarkLogo = getPlanLimits(plan).watermark ? await preloadWatermarkLogo() : undefined;
    try {
      const { blob, extension } = await encodeAnimation({
        width,
        height,
        fps,
        frameCount,
        renderFrame: (ctx, frame) => {
          animator.draw(ctx, base, frame / frameCount, width, height);
          if (watermarkLogo !== undefined) drawWatermarkPill(ctx, width, height, watermarkLogo);
        },
        onProgress: setProgress,
      });
      triggerDownload(blob, `bitgrain-${animator.id}-${Date.now()}.${extension}`);
      trackEvent("studio", "export_animation", {
        details: { format: extension, width, height, animator: animator.id },
      });
      trackEvent("home", "animate_exported", {
        details: { format: extension, animator: animator.id, fps, duration_sec: durationSec, framing },
      });
      setExporting(false);
      onClose();
    } catch (err) {
      trackEvent("home", "animate_export_failed", {
        details: { animator: animator.id, error_name: err instanceof Error ? err.name : "unknown" },
      });
      setError("export failed in this browser");
      setExporting(false);
    }
  }, [animatorId, durationSec, fps, onClose, framing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm font-editorial">
      <div className="relative flex flex-col bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden max-w-[min(90vw,820px)] max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Film size={14} /> animate
          </span>
          <div className="flex items-center gap-3">
            <a
              href="/docs/03-effects/08-animate-a-still"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors no-underline"
            >
              <BookOpen size={12} /> Guide
            </a>
            <button onClick={() => { trackEvent("home", "animate_cancelled"); onClose(); }} className="text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center overflow-hidden min-w-[min(280px,90vw)] min-h-[200px] max-h-[calc(90vh-220px)] bg-zinc-900">
          {!hasImage ? (
            <span className="text-xs text-zinc-500 py-16">upload an image first</span>
          ) : ready ? (
            <canvas
              ref={previewCanvasRef}
              className="block max-w-full max-h-[calc(90vh-220px)] object-contain"
            />
          ) : (
            <span className="text-xs text-zinc-500 py-16">rendering…</span>
          )}
        </div>

        <div className="px-4 py-3 border-t border-zinc-800 shrink-0 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {ANIMATORS.map((animator) => (
              <button
                key={animator.id}
                onClick={() => setAnimatorId(animator.id)}
                className={`px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
                  animatorId === animator.id
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                }`}
              >
                {animator.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-44">
              <Slider
                label="Length"
                min={DURATION_MIN}
                max={DURATION_MAX}
                step={DURATION_STEP}
                value={durationSec}
                suffix="s"
                onChange={setDurationSec}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400">fps</span>
              {FPS_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setFps(option)}
                  className={`px-2 py-0.5 rounded-md text-[11px] border transition-colors ${
                    fps === option
                      ? "border-zinc-600 bg-zinc-800 text-zinc-100"
                      : "border-zinc-800 text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <AnimateFramingPicker />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-500">
              {exporting
                ? `encoding… ${Math.round(progress * 100)}%`
                : "exports a seamless loop"}
            </span>
            <button
              onClick={handleExport}
              disabled={!ready || exporting}
              className="flex items-center gap-1.5 text-xs font-semibold text-black bg-white hover:bg-zinc-100 px-4 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={12} /> {exporting ? "exporting…" : "export video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
