import React, { useLayoutEffect, useRef } from "react";
import { Download } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { exportProgressSignal, INDETERMINATE, type ExportProgressState } from "@bitgrain/engine/export/export-progress";
import { RollingNumber } from "@bitgrain/ui/motion/rolling-number/RollingNumber";
import { clamp } from "@bitgrain/ui/motion/shared/math";

const ICON_SIZE = 13;
const PERCENT = 100;
const IDLE_CLASS = "bg-[var(--s-text)] text-[var(--s-bg-panel)] hover:brightness-110";
const WORKING_CLASS = "bg-[var(--s-bg-input)] text-[var(--s-text)] cursor-progress";

interface ExportMorphButtonProps {
  exporting: boolean;
  label: string;
  onClick: () => void;
}

const percentFor = (progress: ExportProgressState | null): number | null =>
  progress && progress.value !== INDETERMINATE && progress.phase !== "done" ? Math.round(clamp(progress.value, 0, 1) * PERCENT) : null;

export const ExportMorphButton: React.FC<ExportMorphButtonProps> = ({ exporting, label, onClick }) => {
  const fillRef = useRef<HTMLSpanElement>(null);
  const progress = useSignalValue(exportProgressSignal);
  const percent = exporting ? percentFor(progress) : null;

  useLayoutEffect(() => {
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${(percent ?? 0) / PERCENT})`;
  }, [percent]);

  return (
    <button
      onClick={onClick}
      disabled={exporting}
      aria-busy={exporting}
      className={`group relative overflow-hidden flex items-center justify-center gap-2 border-none cursor-pointer text-[12.5px] font-medium font-inherit h-10 w-full rounded-xl transition-[background-color,color,transform] duration-200 active:scale-[0.97] ${exporting ? WORKING_CLASS : IDLE_CLASS}`}
    >
      {exporting && percent !== null && <span ref={fillRef} className="absolute inset-0 origin-left bg-[var(--s-text)]/15 transition-transform duration-200 ease-out" />}
      {exporting && percent === null && <span className="preview-loader-bar absolute inset-y-0 left-0 w-1/3 bg-[var(--s-text)]/10" />}
      <span className="relative flex items-center gap-2">
        {exporting ? "Exporting" : <Download size={ICON_SIZE} strokeWidth={1.75} className="transition-transform duration-150 group-active:translate-y-0.5" />}
        {exporting ? percent !== null && <RollingNumber value={percent} suffix="%" /> : label}
      </span>
    </button>
  );
};
