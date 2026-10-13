import React, { useRef, useState, useEffect, useCallback } from "react";
import { resolveExportPlan } from "../../lib/plan-gate/resolve-export-plan";
import { X, Download, Layers, BookOpen } from "lucide-react";
import { zipSync } from "fflate";
import { trackEvent } from "../../lib/tracker";
import { imageSignal } from "../../store/image-store";
import { separateRiso, type RisoResult } from "../../engine/riso-client";
import {
  RISO_INKS,
  DEFAULT_RISO_INK_IDS,
  MAX_RISO_INKS,
  getRisoInk,
} from "../../engine/riso-inks";
import { capLongEdgeForPlan } from "../../lib/plan-gate/plan-long-edge";
import { watermarkCanvasForPlan } from "../../lib/plan-gate/watermark-for-plan";

interface RisoExportModalProps {
  onClose: () => void;
}

const PREVIEW_MAX = 900;
const EXPORT_MAX = 2400;
const DEBOUNCE_MS = 140;

const buildWorkingImageData = (
  img: HTMLImageElement,
  maxDim: number,
): ImageData | null => {
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = Math.min(1, maxDim / longEdge);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};

const imageDataToPng = async (data: ImageData, plan: string): Promise<Uint8Array> => {
  const canvas = document.createElement("canvas");
  canvas.width = data.width;
  canvas.height = data.height;
  canvas.getContext("2d")?.putImageData(data, 0, 0);
  await watermarkCanvasForPlan(canvas, plan);
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(new Uint8Array());
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png");
  });
};

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const ChannelThumb: React.FC<{ data: ImageData; label: string; rgb: number[] }> = ({
  data,
  label,
  rgb,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = data.width;
    canvas.height = data.height;
    canvas.getContext("2d")?.putImageData(data, 0, 0);
  }, [data]);
  return (
    <div className="flex flex-col items-center gap-1">
      <canvas
        ref={canvasRef}
        className="w-16 h-16 object-contain rounded border border-zinc-700 bg-white"
      />
      <span className="flex items-center gap-1 text-[10px] text-zinc-400">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` }}
        />
        {label}
      </span>
    </div>
  );
};

export const RisoExportModal: React.FC<RisoExportModalProps> = ({ onClose }) => {
  const imageUrl = imageSignal.value;
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewTokenRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_RISO_INK_IDS);
  const [result, setResult] = useState<RisoResult | null>(null);
  const [exporting, setExporting] = useState(false);

  const selectedInks = useCallback(
    () => selectedIds.map((id) => getRisoInk(id)).filter((ink) => !!ink),
    [selectedIds],
  );

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const runPreview = useCallback(async () => {
    const img = imgRef.current;
    const inks = selectedInks();
    if (!img || inks.length === 0) return;
    const token = previewTokenRef.current + 1;
    previewTokenRef.current = token;
    const working = buildWorkingImageData(img, PREVIEW_MAX);
    if (!working) return;
    const next = await separateRiso(working, inks.map((ink) => ink.rgb));
    if (token !== previewTokenRef.current) return;
    setResult(next);
  }, [selectedInks]);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => void runPreview(), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [loaded, runPreview]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !result) return;
    canvas.width = result.preview.width;
    canvas.height = result.preview.height;
    canvas.getContext("2d")?.putImageData(result.preview, 0, 0);
  }, [result]);

  const toggleInk = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        if (current.length === 1) return current;
        return current.filter((value) => value !== id);
      }
      if (current.length >= MAX_RISO_INKS) return current;
      return [...current, id];
    });
  };

  const exportZip = async () => {
    const plan = await resolveExportPlan();
    if (!plan) return;
    const img = imgRef.current;
    const inks = selectedInks();
    if (!img || inks.length === 0) return;
    setExporting(true);
    const working = buildWorkingImageData(img, capLongEdgeForPlan(plan, EXPORT_MAX));
    if (!working) {
      setExporting(false);
      return;
    }
    const separated = await separateRiso(working, inks.map((ink) => ink.rgb));
    const files: Record<string, Uint8Array> = {
      "preview.png": await imageDataToPng(separated.preview, plan),
    };
    for (let layer = 0; layer < separated.layers.length; layer += 1) {
      const ink = inks[layer];
      const name = `${String(layer + 1).padStart(2, "0")}-${ink.id}.png`;
      files[name] = await imageDataToPng(separated.layers[layer], plan);
    }
    const zipped = zipSync(files, { level: 6 });
    triggerDownload(
      new Blob([new Uint8Array(zipped)], { type: "application/zip" }),
      `bitgrain-riso-${Date.now()}.zip`,
    );
    trackEvent("studio", "export_riso", {
      details: { format: "zip", page_count: separated.layers.length },
    });
    trackEvent("home", "riso_exported", {
      details: { ink_ids: inks.map((ink) => ink.id), ink_count: inks.length },
    });
    setExporting(false);
    onClose();
  };

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm font-editorial">
      <div className="relative flex flex-col bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden max-w-[min(90vw,860px)] max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers size={14} /> risograph separation
          </span>
          <div className="flex items-center gap-3">
            <a
              href="/docs/03-effects/07-risograph-separations"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors no-underline"
            >
              <BookOpen size={12} /> Guide
            </a>
            <button onClick={() => { trackEvent("home", "riso_export_cancelled"); onClose(); }} className="text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center overflow-hidden min-w-[min(280px,90vw)] min-h-[200px] max-h-[calc(90vh-260px)] bg-zinc-900">
          {loaded ? (
            <canvas
              ref={previewCanvasRef}
              className="block max-w-full max-h-[calc(90vh-260px)] object-contain bg-white"
            />
          ) : (
            <span className="text-xs text-zinc-500 py-16">loading image…</span>
          )}
        </div>

        {result && result.layers.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 border-t border-zinc-800 overflow-x-auto no-scrollbar shrink-0">
            {result.layers.map((layer, index) => {
              const ink = selectedInks()[index];
              if (!ink) return null;
              return (
                <ChannelThumb key={ink.id} data={layer} label={ink.name} rgb={ink.rgb} />
              );
            })}
          </div>
        )}

        <div className="px-4 py-3 border-t border-zinc-800 shrink-0 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {RISO_INKS.map((ink) => {
              const active = selectedIds.includes(ink.id);
              return (
                <button
                  key={ink.id}
                  onClick={() => toggleInk(ink.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
                    active
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: `rgb(${ink.rgb[0]},${ink.rgb[1]},${ink.rgb[2]})` }}
                  />
                  {ink.name}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-500">
              {selectedIds.length} ink{selectedIds.length === 1 ? "" : "s"} · exports a zip of print-ready layers
            </span>
            <button
              onClick={exportZip}
              disabled={!loaded || exporting}
              className="flex items-center gap-1.5 text-xs font-semibold text-black bg-white hover:bg-zinc-100 px-4 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={12} /> {exporting ? "exporting…" : "export zip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
