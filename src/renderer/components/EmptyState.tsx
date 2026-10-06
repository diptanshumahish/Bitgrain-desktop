import React, { useRef } from "react";
import { Upload, ArrowRight } from "lucide-react";
import { AsciiBackground } from "./AsciiBackground";
import { openTab } from "../store/document-tabs-store";
import { IMAGE_ACCEPT } from "../pages/home-page/accept-formats";

interface Props {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadFile: (file: File) => void;
  onLoadSample: () => void;
  isDark?: boolean;
}

export const EmptyState: React.FC<Props> = ({
  onUpload,
  onUploadFile,
  onLoadSample,
  isDark = false,
}) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragDepthRef = useRef(0);

  const setDragActive = (active: boolean) => {
    if (dropZoneRef.current) {
      dropZoneRef.current.dataset.drag = active ? "true" : "false";
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onUploadFile(file);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 pb-40 pt-12 md:pb-28">
      <AsciiBackground isDark={isDark} />

      <div className="relative z-10 flex w-full max-w-[380px] flex-col items-center text-center">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--s-text)]">
          Drop an image to begin
        </h1>
        <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-[var(--s-text-muted)]">
          Halftone, dither, ASCII and grain — rendered locally on your device, never with AI.
        </p>

        <div
          ref={dropZoneRef}
          data-drag="false"
          onDragEnter={handleDragEnter}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="group mt-7 w-full"
        >
          <label className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--s-border)] bg-[var(--s-bg-panel)]/50 px-6 py-7 transition-colors hover:border-[var(--s-accent)]/60 hover:bg-[var(--s-bg-panel)] group-data-[drag=true]:border-[var(--s-accent)] group-data-[drag=true]:bg-[var(--s-accent-soft)]">
            <input type="file" className="hidden" onChange={onUpload} accept={IMAGE_ACCEPT} />
            <Upload
              size={20}
              strokeWidth={1.75}
              className="text-[var(--s-text-muted)] transition-colors group-data-[drag=true]:text-[var(--s-accent)]"
            />
            <span className="text-[13px] text-[var(--s-text)]">
              <span className="font-semibold">Drop an image</span> or click to browse
            </span>
            <span className="text-[10.5px] uppercase tracking-wide text-[var(--s-text-muted)]">
              PNG · JPG · WEBP · HEIC
            </span>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2.5">
          <button
            onClick={onLoadSample}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--s-text)] px-4 py-2 text-[13px] font-semibold text-[var(--s-bg-panel)] transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Try a sample
          </button>
          <button
            onClick={() => openTab("studio")}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-[var(--s-border)] px-4 py-2 text-[13px] font-medium text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)] active:scale-[0.98]"
          >
            Open studio
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
