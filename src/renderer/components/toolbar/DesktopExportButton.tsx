import React, { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { ExportPopover } from "./ExportPopover";
import { signal, useSignalValue } from "../../lib/signal";
import type { DownloadRasterFn } from "../../engine/export/export-types";

// Exported so the native "Export Image…" menu command can open the darkroom's
// export popover, which otherwise only opens from the title-bar button.
export const desktopExportOpenSignal = signal(false);
const isOpenSignal = desktopExportOpenSignal;

interface DesktopExportButtonProps {
  credits: { png: number; svg: number };
  transparentBg: boolean;
  onToggleTransparentBg: () => void;
  onDownloadRaster: DownloadRasterFn;
  onDownloadSvg: (transparent: boolean) => void;
  onSharePreset: () => void;
  shareState: "idle" | "copied";
  isLUT?: boolean;
  imageData?: string;
  effectsData?: {
    modes: string[];
    lutId: string | null;
    ditherMethod: string;
    ditherFactor: number;
    resolution: number;
    contrast: number;
    brightness: number;
    saturation: number;
    grain: number;
    hue: number;
    isColor: boolean;
    palette: { id: string; colors: string[] } | null;
    hazeIntensity: number;
    bloomIntensity: number;
    bloomThreshold: number;
    hazeWarmth: string;
  };
}

export const DesktopExportButton: React.FC<DesktopExportButtonProps> = (props) => {
  const isOpen = useSignalValue(isOpenSignal);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        isOpenSignal.value = false;
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <button
        onClick={() => { isOpenSignal.value = !isOpenSignal.value; }}
        className="flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-black/5 dark:border-white/10 px-3 py-2 rounded-full hover:border-[var(--s-accent)] transition-all font-editorial active:scale-95"
      >
        <Download size={12} strokeWidth={2} className="text-zinc-500 dark:text-zinc-400" />
        <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-100">Export</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-[var(--s-bg-panel)] rounded-[24px] border border-black/5 dark:border-white/5 overflow-hidden animate-popover font-editorial z-50">
          <ExportPopover
            credits={props.credits}
            transparentBg={props.transparentBg}
            onToggleTransparentBg={props.onToggleTransparentBg}
            onDownloadRaster={props.onDownloadRaster}
            onDownloadSvg={props.onDownloadSvg}
            onSharePreset={props.onSharePreset}
            shareState={props.shareState}
            isLUT={props.isLUT}
            imageData={props.imageData}
            effectsData={props.effectsData}
            onClose={() => { isOpenSignal.value = false; }}
          />
        </div>
      )}
    </div>
  );
};
