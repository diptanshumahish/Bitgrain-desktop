import React, { useRef, useCallback, useEffect, useState } from "react";
import { X, Layers, Info, Download, Trash2, BookOpen } from "lucide-react";
import {
  useBatchProcessor,
  type BatchExportFormat,
} from "../../../hooks/useBatchProcessor";
import { usePayment } from "../../../hooks/usePayment";
import { useCustomPresets } from "../../../hooks/useCustomPresets";
import { renderBatchPreview } from "../../../engine/BatchRenderer";
import { PRESETS } from "../../toolbar/popovers/PresetsPopover";
import { captureSnapshot, type TransformSnapshot } from "../../../store/transform-store";
import { presetToSnapshot } from "../../../engine/presets/preset-snapshot";
import { emitModal } from "../../../lib/event-bus";
import { BatchEffectList } from "./BatchEffectList";
import { BatchFileGrid } from "./BatchFileGrid";
import { trackEvent } from "../../../lib/tracker";

type EffectSelection = "current" | string;

interface BatchProcessorProps {
  onClose: () => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({ onClose }) => {
  const { canBatch, consumeCredits } = usePayment();
  const { customPresets } = useCustomPresets();
  const [format, setFormat] = useState<BatchExportFormat>("png");
  const [selectedEffect, setSelectedEffect] =
    useState<EffectSelection>("current");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewAbortRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const allPresets = [...PRESETS, ...customPresets];
  const currentSnapshot = captureSnapshot();

  const selectedPreset = allPresets.find((preset) => preset.name === selectedEffect);
  const activeSnapshot: TransformSnapshot =
    selectedEffect !== "current" && selectedPreset
      ? presetToSnapshot(currentSnapshot, selectedPreset.config)
      : currentSnapshot;

  const {
    items,
    isProcessing,
    doneCount,
    pendingCount,
    totalCount,
    allDone,
    addFiles,
    removeItem,
    clearAll,
    resetToPending,
    processAll,
    cancel,
    downloadZip,
  } = useBatchProcessor({
    snapshot: activeSnapshot,
    format,
    consumeCredits,
    onNeedCredits: () => {
      onClose();
      emitModal({ type: "studio-payment" });
      trackEvent("payment", "modal_opened", { details: { trigger: "batch_insufficient_credits" } });
    },
  });

  useEffect(() => {
    const firstItem = items[0];
    const token = { cancelled: false };
    previewAbortRef.current = token;
    (async () => {
      if (!firstItem) {
        setPreviewUrl(null);
        return;
      }
      setIsGeneratingPreview(true);
      try {
        const canvas = await renderBatchPreview(firstItem.file, activeSnapshot);
        if (token.cancelled) return;
        setPreviewUrl(canvas.toDataURL("image/png"));
      } catch {
        if (!token.cancelled) setPreviewUrl(null);
      } finally {
        if (!token.cancelled) setIsGeneratingPreview(false);
      }
    })();
    return () => {
      token.cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEffect, items[0]?.id]);

  const handleSelectEffect = useCallback(
    (effect: EffectSelection) => {
      setSelectedEffect(effect);
      resetToPending();
      const isBuiltIn = effect === "current" || PRESETS.some((preset) => preset.name === effect);
      trackEvent("batch", "effect_selected", { details: { effect: isBuiltIn ? effect : "custom" } });
    },
    [resetToPending],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      addFiles(Array.from(files));
      trackEvent("batch", "files_added", { details: { count: files.length } });
    },
    [addFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const effectLabel =
    selectedEffect === "current"
      ? currentSnapshot.modes.join(" + ")
      : selectedEffect;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-xl border border-zinc-200 w-full sm:max-w-3xl max-h-[92vh] flex flex-col overflow-hidden font-editorial"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            <Layers size={14} strokeWidth={2} className="text-zinc-400" />
            <h2 className="text-[13px] font-semibold text-zinc-800">
              Batch Export
            </h2>
            <span className="text-[8px] font-semibold text-zinc-900 bg-violet-300 px-1.5 py-0.5 rounded">
              beta
            </span>
            <span className="text-[10px] text-zinc-400">
              · up to 50 images at once
            </span>
            <div className="relative group">
              <button className="w-4 h-4 flex items-center justify-center rounded-full text-zinc-300 hover:text-zinc-500 transition-colors">
                <Info size={13} strokeWidth={2} />
              </button>
              <div className="absolute left-0 top-full mt-2 w-56 bg-zinc-900 text-white rounded-lg px-3 py-2.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                <p className="text-[11px] font-semibold mb-1">
                  What is batch export?
                </p>
                <p className="text-[10px] text-zinc-300 leading-relaxed">
                  Apply one effect to many images at once and download
                  everything as a ZIP.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href="/docs/03-effects/09-batch-processing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors no-underline"
            >
              <BookOpen size={12} /> Guide
            </a>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-all"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col sm:flex-row h-full">
            <BatchEffectList
              selectedEffect={selectedEffect}
              onSelectEffect={handleSelectEffect}
              isGeneratingPreview={isGeneratingPreview}
              previewUrl={previewUrl}
              effectLabel={effectLabel}
              customPresets={customPresets}
            />
            <BatchFileGrid
              items={items}
              isProcessing={isProcessing}
              isDragging={isDragging}
              doneCount={doneCount}
              totalCount={totalCount}
              fileInputRef={fileInputRef}
              onRemoveItem={removeItem}
              onFiles={handleFiles}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
              {(["png", "svg"] as BatchExportFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFormat(f);
                    trackEvent("batch", "format_selected", { details: { format: f } });
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${format === f ? "bg-white text-zinc-800" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && !isProcessing && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all"
              >
                <Trash2 size={11} strokeWidth={2} /> Clear
              </button>
            )}
            {isProcessing ? (
              <button
                onClick={() => {
                  cancel();
                  trackEvent("batch", "processing_cancelled", { details: { done_count: doneCount, total_count: totalCount } });
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
              >
                Cancel
              </button>
            ) : (
              <>
                {allDone && (
                  <button
                    onClick={() => {
                      downloadZip();
                      trackEvent("batch", "zip_downloaded", { details: { count: totalCount } });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-all"
                  >
                    <Download size={12} strokeWidth={2.5} /> Download ZIP
                  </button>
                )}
                {pendingCount > 0 &&
                  (canBatch ? (
                    <button
                      onClick={() => {
                        processAll();
                        trackEvent("batch", "processing_started", { details: { count: pendingCount, format } });
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-all"
                    >
                      <Layers size={12} strokeWidth={2.5} /> Process{" "}
                      {pendingCount} · {format.toUpperCase()}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        emitModal({ type: "studio-payment" });
                        trackEvent("payment", "modal_opened", { details: { trigger: "batch_upgrade_click" } });
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-all"
                    >
                      <Download size={12} strokeWidth={2.5} /> Upgrade for batch
                    </button>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
