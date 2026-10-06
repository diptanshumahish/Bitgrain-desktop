import React from "react";
import { Upload, X, Loader, CheckCircle, AlertCircle } from "lucide-react";
import type { BatchItem } from "../../../hooks/useBatchProcessor";

interface BatchFileGridProps {
  items: BatchItem[];
  isProcessing: boolean;
  isDragging: boolean;
  doneCount: number;
  totalCount: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onRemoveItem: (id: string) => void;
  onFiles: (files: FileList | null) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
}

export const BatchFileGrid: React.FC<BatchFileGridProps> = ({
  items,
  isProcessing,
  isDragging,
  doneCount,
  totalCount,
  fileInputRef,
  onRemoveItem,
  onFiles,
  onDrop,
  onDragOver,
  onDragLeave,
}) => (
  <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer transition-all ${
        isDragging
          ? "border-violet-400 bg-violet-50"
          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80"
      }`}
    >
      <Upload size={16} strokeWidth={1.5} className="text-zinc-400" />
      <p className="text-[11px] font-medium text-zinc-500">
        Drop sprites / images or <span className="text-violet-500">browse</span>
      </p>
      <p className="text-[9px] text-zinc-400">PNG · JPG · WEBP · HEIC · up to 50 files</p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
    </div>

    {items.length > 0 && (
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
        {items.map((item) => (
          <div key={item.id} className="relative group aspect-square">
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="w-full h-full object-cover rounded-md border border-zinc-100 rendering-pixelated"
            />
            {item.status === "processing" && (
              <div className="absolute inset-0 rounded-md bg-black/30 flex items-center justify-center">
                <Loader size={12} className="text-white animate-spin" />
              </div>
            )}
            {item.status === "done" && (
              <div className="absolute inset-0 rounded-md bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={12} className="text-emerald-600" />
              </div>
            )}
            {item.status === "error" && (
              <div className="absolute inset-0 rounded-md bg-red-500/20 flex items-center justify-center" title={item.errorMsg}>
                <AlertCircle size={12} className="text-red-500" />
              </div>
            )}
            {!isProcessing && (
              <button
                onClick={() => onRemoveItem(item.id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-700 text-white items-center justify-center hidden group-hover:flex z-10"
              >
                <X size={8} strokeWidth={3} />
              </button>
            )}
          </div>
        ))}
      </div>
    )}

    {isProcessing && (
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-zinc-500">
          <span>Processing…</span>
          <span>{doneCount} / {totalCount}</span>
        </div>
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-400 rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>
    )}
  </div>
);
